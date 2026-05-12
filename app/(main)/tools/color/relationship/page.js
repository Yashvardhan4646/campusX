"use client";

import { useState, useEffect } from "react";
import { Palette, Copy, RefreshCw, Layers, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import { toast } from "sonner";
import chroma from "chroma-js";

export default function ColorRelationshipTool() {
    const [color, setColor] = useState("#6366f1");
    const [relationships, setRelationships] = useState({
        complementary: [],
        triadic: [],
        tetradic: [],
        analogous: [],
        monochromatic: [],
    });

    const generateRelationships = (val) => {
        if (!chroma.valid(val)) return;
        
        const c = chroma(val);
        const h = c.get('hsl.h');
        const s = c.get('hsl.s');
        const l = c.get('hsl.l');

        setRelationships({
            complementary: [val, c.set('hsl.h', (h + 180) % 360).hex()],
            triadic: [
                val,
                c.set('hsl.h', (h + 120) % 360).hex(),
                c.set('hsl.h', (h + 240) % 360).hex(),
            ],
            tetradic: [
                val,
                c.set('hsl.h', (h + 90) % 360).hex(),
                c.set('hsl.h', (h + 180) % 360).hex(),
                c.set('hsl.h', (h + 270) % 360).hex(),
            ],
            analogous: [
                c.set('hsl.h', (h - 30 + 360) % 360).hex(),
                val,
                c.set('hsl.h', (h + 30) % 360).hex(),
            ],
            monochromatic: chroma.scale([c.brighten(1.5), val, c.darken(1.5)]).colors(5),
        });
    };

    useEffect(() => {
        generateRelationships(color);
    }, [color]);

    const copyToClipboard = (txt) => {
        navigator.clipboard.writeText(txt);
        toast.success(`Copied ${txt.toUpperCase()}`);
    };

    return (
        <ColorToolLayout
            title="Color Relationships"
            description="Explore color theory by generating complementary, triadic, and analogous color schemes from a base color."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Base Color</Label>
                            <div className="flex gap-4 items-center">
                                <div 
                                    className="w-20 h-20 rounded-2xl shadow-xl border border-white/10 shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="flex-1 space-y-2">
                                    <Input 
                                        type="text" 
                                        value={color} 
                                        onChange={(e) => setColor(e.target.value)}
                                        className="font-mono text-lg uppercase"
                                    />
                                    <div className="relative h-10 w-full overflow-hidden rounded-lg">
                                        <input 
                                            type="color" 
                                            value={color} 
                                            onChange={(e) => setColor(e.target.value)}
                                            className="absolute -inset-2 w-[120%] h-[120%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => setColor(chroma.random().hex())} variant="outline" className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Random Color
                        </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-tighter">
                            <Info className="w-3 h-3" />
                            Color Theory Tip
                        </div>
                        <p className="text-[10px] text-blue-200/70 leading-relaxed">
                            <strong>Analogous</strong> colors are next to each other on the color wheel. They usually match well and create serene and comfortable designs.
                        </p>
                    </div>
                </div>

                {/* Schemes Section */}
                <div className="lg:col-span-3 space-y-8">
                    {Object.entries(relationships).map(([name, colors]) => (
                        <div key={name} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">{name}</h3>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(colors.join(", "))} className="h-7 text-[10px] uppercase font-bold">
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy All
                                </Button>
                            </div>
                            <div className="flex h-24 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                                {colors.map((c, i) => (
                                    <button 
                                        key={i}
                                        className="flex-1 group relative flex items-end justify-center p-2 hover:flex-[1.5] transition-all duration-300"
                                        style={{ backgroundColor: c }}
                                        onClick={() => copyToClipboard(c)}
                                        title={c}
                                    >
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <span className="relative z-10 text-[10px] font-black text-white drop-shadow-md uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                            {c}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ColorToolLayout>
    );
}
