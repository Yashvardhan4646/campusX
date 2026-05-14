"use client";

import { useState, useEffect } from "react";
import { Copy, SortAsc, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function SortDedupeTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [removeDuplicates, setRemoveDuplicates] = useState(true);
    const [trimLines, setTrimLines] = useState(true);
    const [ignoreCase, setIgnoreCase] = useState(true);

    const process = () => {
        if (!input) {
            setOutput("");
            return;
        }

        let lines = input.split("\n");

        if (trimLines) {
            lines = lines.map(line => line.trim());
        }

        if (removeDuplicates) {
            if (ignoreCase) {
                const seen = new Set();
                lines = lines.filter(line => {
                    const lower = line.toLowerCase();
                    if (seen.has(lower)) return false;
                    seen.add(lower);
                    return true;
                });
            } else {
                lines = [...new Set(lines)];
            }
        }

        lines.sort((a, b) => {
            let valA = ignoreCase ? a.toLowerCase() : a;
            let valB = ignoreCase ? b.toLowerCase() : b;
            
            if (sortOrder === "asc") {
                return valA.localeCompare(valB);
            } else if (sortOrder === "desc") {
                return valB.localeCompare(valA);
            } else if (sortOrder === "length-asc") {
                return a.length - b.length;
            } else if (sortOrder === "length-desc") {
                return b.length - a.length;
            }
            return 0;
        });

        setOutput(lines.join("\n"));
    };

    useEffect(() => {
        process();
    }, [input, sortOrder, removeDuplicates, trimLines, ignoreCase]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Line Sort & Dedupe"
            description="Organize your lists by sorting lines and removing duplicates instantly."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Alphabetical (A-Z)</SelectItem>
                                    <SelectItem value="desc">Reverse (Z-A)</SelectItem>
                                    <SelectItem value="length-asc">Length (Short to Long)</SelectItem>
                                    <SelectItem value="length-desc">Length (Long to Short)</SelectItem>
                                    <SelectItem value="none">No Sort</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id="dedupe" 
                                    checked={removeDuplicates} 
                                    onCheckedChange={setRemoveDuplicates}
                                />
                                <Label htmlFor="dedupe" className="cursor-pointer">Remove Duplicates</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id="trim" 
                                    checked={trimLines} 
                                    onCheckedChange={setTrimLines}
                                />
                                <Label htmlFor="trim" className="cursor-pointer">Trim Lines</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id="ignoreCase" 
                                    checked={ignoreCase} 
                                    onCheckedChange={setIgnoreCase}
                                />
                                <Label htmlFor="ignoreCase" className="cursor-pointer">Ignore Case</Label>
                            </div>
                        </div>

                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => setInput("")}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Input List</Label>
                            <Textarea
                                placeholder="Enter list items, one per line..."
                                className="min-h-[400px] text-base font-mono"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold">Processed List</Label>
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
                            <div className="min-h-[400px] w-full rounded-md border border-input bg-muted/30 p-4 text-base font-mono whitespace-pre overflow-auto">
                                {output || (
                                    <span className="text-muted-foreground italic">
                                        Processed list will appear here...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
