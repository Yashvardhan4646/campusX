"use client";

import { useState, useEffect } from "react";
import { Copy, Split, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function DelimiterTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [inputDelimiter, setInputDelimiter] = useState(",");
    const [outputDelimiter, setOutputDelimiter] = useState("\\n");
    const [trimItems, setTrimItems] = useState(true);

    const getDelimiter = (del) => {
        if (del === "\\n") return "\n";
        if (del === "\\t") return "\t";
        return del;
    };

    const process = () => {
        if (!input) {
            setOutput("");
            return;
        }

        const inDel = getDelimiter(inputDelimiter);
        const outDel = getDelimiter(outputDelimiter);

        let items = input.split(inDel);
        
        if (trimItems) {
            items = items.map(item => item.trim());
        }

        setOutput(items.join(outDel));
    };

    useEffect(() => {
        process();
    }, [input, inputDelimiter, outputDelimiter, trimItems]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Text Delimiter"
            description="Easily split and join text by changing delimiters (e.g., CSV to Newline, Tabs to Commas)."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-2">
                            <Label>Input Delimiter</Label>
                            <Input 
                                value={inputDelimiter} 
                                onChange={(e) => setInputDelimiter(e.target.value)} 
                                placeholder="e.g. , or \n"
                            />
                            <p className="text-[10px] text-muted-foreground">Use \n for newline, \t for tab</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Output Delimiter</Label>
                            <Input 
                                value={outputDelimiter} 
                                onChange={(e) => setOutputDelimiter(e.target.value)} 
                                placeholder="e.g. \n or |"
                            />
                        </div>

                        <div className="flex items-center space-x-3">
                            <input 
                                type="checkbox" 
                                id="trim" 
                                checked={trimItems} 
                                onChange={(e) => setTrimItems(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="trim" className="cursor-pointer">Trim Items</Label>
                        </div>

                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setInput("")}
                        >
                            Clear Input
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Input Text</Label>
                        <Textarea
                            placeholder="Enter text with input delimiter..."
                            className="min-h-[200px] text-base font-mono"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Processed Text</Label>
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
                        <div className="min-h-[200px] w-full rounded-md border border-input bg-muted/30 p-4 text-base font-mono whitespace-pre overflow-auto">
                            {output || (
                                <span className="text-muted-foreground italic">
                                    Processed text will appear here...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
