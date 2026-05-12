"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Upload, ImageIcon, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

const ASCII_CHARS = "@%#*+=-:. ";

export default function AsciiImageTool() {
    const [image, setImage] = useState(null);
    const [ascii, setAscii] = useState("");
    const [width, setWidth] = useState(100);
    const [contrast, setContrast] = useState(1);
    const [inverted, setInverted] = useState(false);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const convertToAscii = () => {
        if (!image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = image.height / image.width;
        // Font character aspect ratio (usually around 0.55 for monospaced)
        const charAspectRatio = 0.55;
        const h = Math.floor(width * aspectRatio * charAspectRatio);
        
        canvas.width = width;
        canvas.height = h;
        
        ctx.drawImage(image, 0, 0, width, h);
        const imageData = ctx.getImageData(0, 0, width, h);
        const pixels = imageData.data;
        
        let asciiStr = "";
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                // Relative luminance
                let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
                
                // Apply contrast
                brightness = (brightness - 0.5) * contrast + 0.5;
                brightness = Math.max(0, Math.min(1, brightness));
                
                if (inverted) brightness = 1 - brightness;
                
                const charIndex = Math.floor(brightness * (ASCII_CHARS.length - 1));
                asciiStr += ASCII_CHARS[charIndex];
            }
            asciiStr += "\n";
        }
        
        setAscii(asciiStr);
    };

    useEffect(() => {
        if (image) convertToAscii();
    }, [image, width, contrast, inverted]);

    const copyToClipboard = () => {
        if (!ascii) return;
        navigator.clipboard.writeText(ascii);
        toast.success("ASCII art copied to clipboard");
    };

    const downloadAscii = () => {
        if (!ascii) return;
        const element = document.createElement("a");
        const file = new Blob([ascii], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "ascii-art.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <TextToolLayout
            title="ASCII Art Generator"
            description="Transform your images into unique ASCII character representations."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-2">
                            <Label>Upload Image</Label>
                            <Button 
                                variant="outline" 
                                className="w-full h-24 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6" />
                                    <span className="text-xs">Click to upload</span>
                                </div>
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {image && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Output Width: {width}</Label>
                                    </div>
                                    <Slider 
                                        value={[width]} 
                                        min={20} 
                                        max={200} 
                                        step={1} 
                                        onValueChange={(val) => setWidth(val[0])}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Contrast: {contrast.toFixed(1)}</Label>
                                    </div>
                                    <Slider 
                                        value={[contrast]} 
                                        min={0.5} 
                                        max={2} 
                                        step={0.1} 
                                        onValueChange={(val) => setContrast(val[0])}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/30">
                                    <input 
                                        type="checkbox" 
                                        id="inverted" 
                                        checked={inverted} 
                                        onChange={(e) => setInverted(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="inverted" className="cursor-pointer">Invert Colors</Label>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button onClick={copyToClipboard} className="w-full">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy ASCII
                                    </Button>
                                    <Button onClick={downloadAscii} variant="outline" className="w-full">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download .txt
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="relative w-full h-full min-h-[500px] rounded-2xl border border-border bg-black p-4 overflow-auto">
                        <canvas ref={canvasRef} className="hidden" />
                        {ascii ? (
                            <pre className="text-[8px] leading-[6px] text-white font-mono whitespace-pre select-all">
                                {ascii}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                <ImageIcon className="w-12 h-12 opacity-20" />
                                <p>Upload an image to generate ASCII art</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
