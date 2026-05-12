"use client";

import { useState, useEffect } from "react";
import { Copy, Code, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function EscapeTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [type, setType] = useState("json");
    const [mode, setMode] = useState("escape");

    const process = () => {
        if (!input) {
            setOutput("");
            return;
        }

        try {
            let result = "";
            if (type === "json") {
                result = mode === "escape" 
                    ? JSON.stringify(input).slice(1, -1) 
                    : JSON.parse(`"${input}"`);
            } else if (type === "html") {
                const div = document.createElement("div");
                if (mode === "escape") {
                    div.textContent = input;
                    result = div.innerHTML;
                } else {
                    div.innerHTML = input;
                    result = div.textContent;
                }
            } else if (type === "url") {
                result = mode === "escape" 
                    ? encodeURIComponent(input) 
                    : decodeURIComponent(input);
            } else if (type === "regex") {
                result = mode === "escape"
                    ? input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                    : input.replace(/\\(.)/g, "$1");
            }
            setOutput(result);
        } catch (error) {
            setOutput("Error: Invalid input for this operation");
        }
    };

    useEffect(() => {
        process();
    }, [input, type, mode]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Escape / Unescape"
            description="Safely handle JS, JSON, HTML, URL, and Regex escaping needs."
        >
            <div className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="json">JSON / JS</SelectItem>
                            <SelectItem value="html">HTML Entities</SelectItem>
                            <SelectItem value="url">URL Encoding</SelectItem>
                            <SelectItem value="regex">Regex</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button
                            variant={mode === "escape" ? "default" : "outline"}
                            onClick={() => setMode("escape")}
                            className="w-32"
                        >
                            Escape
                        </Button>
                        <Button
                            variant={mode === "unescape" ? "default" : "outline"}
                            onClick={() => setMode("unescape")}
                            className="w-32"
                        >
                            Unescape
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Input</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInput("")}
                                className="text-muted-foreground"
                            >
                                Clear
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Enter text to process..."
                            className="min-h-[300px] text-lg resize-none p-4 font-mono"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Output</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!output}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                        <div className="min-h-[300px] w-full rounded-md border border-input bg-muted/30 p-4 text-lg font-mono break-all whitespace-pre-wrap">
                            {output || (
                                <span className="text-muted-foreground italic">
                                    Result will appear here...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
