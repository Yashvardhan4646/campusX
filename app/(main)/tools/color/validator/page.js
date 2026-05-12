"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Info, Search, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function ColorValidatorTool() {
    const [input, setInput] = useState("#6366f1");
    const [results, setResults] = useState({
        hex: { valid: true, value: "" },
        rgb: { valid: true, value: "" },
        hsl: { valid: true, value: "" },
        cmyk: { valid: true, value: "" },
    });

    const validate = (val) => {
        const trimmed = val.trim();
        const res = {
            hex: { valid: false, value: "Invalid format" },
            rgb: { valid: false, value: "Invalid format" },
            hsl: { valid: false, value: "Invalid format" },
            cmyk: { valid: false, value: "Invalid format" },
        };

        // HEX validation
        if (/^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{4}){1,2}$/.test(trimmed)) {
            res.hex = { valid: true, value: trimmed.toUpperCase() };
        }

        // RGB validation
        if (/^rgba?\((\s*\d+\s*,){2}\s*\d+\s*(,\s*\d?\.?\d+\s*)?\)$/.test(trimmed)) {
            res.rgb = { valid: true, value: trimmed };
        }

        // HSL validation
        if (/^hsla?\((\s*\d+\s*,)(\s*\d+%\s*,)\s*\d+%\s*(,\s*\d?\.?\d+\s*)?\)$/.test(trimmed)) {
            res.hsl = { valid: true, value: trimmed };
        }

        // CMYK validation
        if (/^cmyk\((\s*\d+%\s*,){3}\s*\d+%\s*\)$/.test(trimmed)) {
            res.cmyk = { valid: true, value: trimmed };
        }

        // Chroma-js fallback for specific color names or weird formats
        if (chroma.valid(trimmed)) {
            const c = chroma(trimmed);
            if (!res.hex.valid) res.hex = { valid: true, value: c.hex().toUpperCase() };
            if (!res.rgb.valid) res.rgb = { valid: true, value: `rgb(${c.rgb().join(", ")})` };
        }

        setResults(res);
    };

    useEffect(() => {
        validate(input);
    }, [input]);

    const ValidationCard = ({ label, result }) => (
        <div className={`p-6 rounded-2xl border ${result.valid ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                {result.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                )}
            </div>
            <p className={`font-mono text-sm break-all ${result.valid ? "text-foreground" : "text-red-400 opacity-70 italic"}`}>
                {result.value}
            </p>
        </div>
    );

    return (
        <ColorToolLayout
            title="Color Code Validator"
            description="Instantly validate HEX, RGB, HSL, and CMYK color codes against standard syntax rules."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 rounded-3xl border border-border bg-card space-y-8">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Verify Color Code</Label>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Input 
                                        type="text" 
                                        placeholder="Paste color code here..." 
                                        className="h-14 pl-12 text-lg font-mono rounded-2xl border-2 focus:ring-4 transition-all"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                    />
                                    <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-xl shrink-0 transition-colors duration-500"
                                        style={{ backgroundColor: chroma.valid(input) ? input : "transparent" }}
                                    >
                                        {!chroma.valid(input) && (
                                            <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-2xl">
                                                <XCircle className="w-6 h-6 text-muted-foreground opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{chroma.valid(input) ? "Valid Color Format" : "Invalid Color Format"}</p>
                                        <p className="text-xs text-muted-foreground truncate">Syntax validation active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-tighter">
                            <Info className="w-3 h-3" />
                            Supported Formats
                        </div>
                        <ul className="text-[10px] text-violet-200/70 space-y-1 list-disc pl-4">
                            <li>HEX: #FFF, #FFFFFF, #FFFFFFFF</li>
                            <li>RGB: rgb(255, 255, 255)</li>
                            <li>HSL: hsl(0, 0%, 100%)</li>
                            <li>CMYK: cmyk(0%, 0%, 0%, 0%)</li>
                        </ul>
                    </div>
                </div>

                {/* Validation Grid */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ValidationCard label="HEX Code" result={results.hex} />
                        <ValidationCard label="RGB Format" result={results.rgb} />
                        <ValidationCard label="HSL Format" result={results.hsl} />
                        <ValidationCard label="CMYK Format" result={results.cmyk} />
                    </div>

                    <div className="mt-6 p-6 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-4 py-12">
                        <ShieldCheck className="w-12 h-12 text-primary opacity-20" />
                        <div className="max-w-md space-y-2">
                            <h4 className="font-bold text-lg">Standardized Validation</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our validator uses strict regex patterns to ensure your color codes are compatible with modern browsers and CSS standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ColorToolLayout>
    );
}
