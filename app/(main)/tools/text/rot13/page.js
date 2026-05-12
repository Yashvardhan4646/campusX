"use client";

import { useState, useEffect } from "react";
import { Copy, Binary, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function Rot13Tool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const rot13 = (str) => {
        return str.replace(/[a-zA-Z]/g, (c) => {
            return String.fromCharCode(
                (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13)
                    ? c
                    : c - 26
            );
        });
    };

    useEffect(() => {
        setOutput(rot13(input));
    }, [input]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="ROT13 Encoder/Decoder"
            description="A simple substitution cipher that replaces a letter with the 13th letter after it in the alphabet."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Input Text</Label>
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
                        placeholder="Type or paste text to encode/decode..."
                        className="min-h-[300px] text-lg resize-none p-4"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Output (ROT13)</Label>
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
        </TextToolLayout>
    );
}
