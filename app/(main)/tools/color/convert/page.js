"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Hash, Box, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function ColorConverterTool() {
    const [color, setColor] = useState("#6366f1");
    const [mounted, setMounted] = useState(false);
    const [formats, setFormats] = useState({
        hex: "#6366F1",
        rgb: "rgb(99, 102, 241)",
        hsl: "hsl(238.7, 84.5%, 66.7%)",
        cmyk: "cmyk(59%, 58%, 0%, 5%)",
    });

    const updateFormats = (val) => {
        try {
            if (!chroma.valid(val)) return;
            const c = chroma(val);
            setFormats({
                hex: c.hex().toUpperCase(),
                rgb: `rgb(${c.rgb().join(", ")})`,
                hsl: `hsl(${c.hsl()[0].toFixed(1)}, ${(c.hsl()[1] * 100).toFixed(1)}%, ${(c.hsl()[2] * 100).toFixed(1)}%)`,
                cmyk: `cmyk(${(c.cmyk()[0] * 100).toFixed(0)}%, ${(c.cmyk()[1] * 100).toFixed(0)}%, ${(c.cmyk()[2] * 100).toFixed(0)}%, ${(c.cmyk()[3] * 100).toFixed(0)}%)`,
            });
            setColor(c.hex());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setMounted(true);
        updateFormats(color);
    }, [color]);

    if (!mounted) return null;

    const copyToClipboard = (txt) => {
        navigator.clipboard.writeText(txt);
        toast.success("Copied to clipboard");
    };

    return (
        <ColorToolLayout
            title="Universal Color Converter"
            description="Convert your colors between HEX, RGB, HSL, and CMYK formats with real-time accuracy."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-8 rounded-3xl border border-border bg-card space-y-8">
                        <div className="space-y-4">
                            <Label className="text-lg font-bold">Input Color</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-4">
                                    <Input 
                                        type="text" 
                                        placeholder="e.g. #6366f1 or rgb(99, 102, 241)" 
                                        className="h-14 text-xl font-mono uppercase px-6 rounded-2xl border-2 focus:ring-4 transition-all"
                                        value={color}
                                        onChange={(e) => updateFormats(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        {["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFFF33"].map((c) => (
                                            <button 
                                                key={c}
                                                className="w-10 h-10 rounded-xl border border-white/10 hover:scale-110 transition-transform shadow-lg"
                                                style={{ backgroundColor: c }}
                                                onClick={() => updateFormats(c)}
                                            />
                                        ))}
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="ml-auto rounded-xl"
                                            onClick={() => updateFormats(chroma.random().hex())}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div 
                                    className="w-32 h-32 rounded-3xl border-4 border-white/10 shadow-2xl relative overflow-hidden group shrink-0"
                                    style={{ backgroundColor: color }}
                                >
                                    <input 
                                        type="color" 
                                        value={color}
                                        onChange={(e) => updateFormats(e.target.value)}
                                        className="absolute -inset-4 w-[150%] h-[150%] cursor-pointer opacity-0"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Settings2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {Object.entries(formats).map(([label, value]) => (
                        <div 
                            key={label}
                            className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between group hover:border-primary/50 transition-colors shadow-sm"
                        >
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
                                <p className="text-lg font-mono font-bold tracking-tight">{value}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => copyToClipboard(value)}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </ColorToolLayout>
    );
}
