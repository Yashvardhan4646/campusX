"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, Info, Lightbulb, Heart, Zap, Shield, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColorToolLayout from "@/components/tools/ColorToolLayout";
import namer from "color-namer";
import chroma from "chroma-js";

const MEANINGS = {
    red: { psychology: "Energy, passion, danger, action", symbolism: "Love, anger, strength, stop", bestFor: "Call to actions, food industry, high-energy brands" },
    blue: { psychology: "Trust, calm, stability, intelligence", symbolism: "Sea, sky, loyalty, peace", bestFor: "Tech, finance, healthcare, corporate" },
    green: { psychology: "Growth, health, nature, wealth", symbolism: "Environment, money, luck, fertility", bestFor: "Organic products, banking, sustainability" },
    yellow: { psychology: "Happiness, optimism, warmth, caution", symbolism: "Sun, gold, friendship, warning", bestFor: "Childhood products, entertainment, attention-grabbing" },
    purple: { psychology: "Luxury, mystery, wisdom, spirituality", symbolism: "Royalty, magic, ambition, creativity", bestFor: "Premium products, beauty, education" },
    orange: { psychology: "Playfulness, enthusiasm, comfort, vitality", symbolism: "Autumn, fire, fruit, energy", bestFor: "Sports, creative agencies, youth brands" },
    pink: { psychology: "Compassion, sweetness, romance, playfulness", symbolism: "Femininity, kindness, soft, youth", bestFor: "Cosmetics, sweets, florists" },
    black: { psychology: "Power, elegance, sophistication, death", symbolism: "Formal, night, authority, luxury", bestFor: "Fashion, high-end tech, luxury goods" },
    white: { psychology: "Purity, cleanliness, simplicity, emptiness", symbolism: "Cloud, snow, beginning, peace", bestFor: "Minimalist design, health, wedding" },
};

export default function ColorMeaningTool() {
    const [color, setColor] = useState("#6366f1");
    const [colorName, setColorName] = useState("");
    const [meaning, setMeaning] = useState(null);
    const [mounted, setMounted] = useState(false);

    const updateMeaning = (val) => {
        if (!chroma.valid(val)) return;
        setColor(val);
        const names = namer(val);
        const basicName = names.basic[0].name.toLowerCase();
        setColorName(names.ntc[0].name);
        setMeaning(MEANINGS[basicName] || { 
            psychology: "Neutral, balance, professional", 
            symbolism: "Modernity, structure, logic", 
            bestFor: "Architecture, UI components, professional services" 
        });
    };

    useEffect(() => {
        setMounted(true);
        updateMeaning(color);
    }, []);

    if (!mounted) return null;

    return (
        <ColorToolLayout
            title="Color Meaning & Psychology"
            description="Discover the emotional impact and cultural symbolism behind your chosen colors."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase text-muted-foreground">Analyze Color</Label>
                            <div className="flex gap-4 items-center">
                                <div 
                                    className="w-20 h-20 rounded-2xl shadow-xl border border-white/10 shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="flex-1 space-y-2">
                                    <Input 
                                        type="text" 
                                        value={color} 
                                        onChange={(e) => updateMeaning(e.target.value)}
                                        className="font-mono text-lg uppercase"
                                    />
                                    <div className="relative h-10 w-full overflow-hidden rounded-lg">
                                        <input 
                                            type="color" 
                                            value={color} 
                                            onChange={(e) => updateMeaning(e.target.value)}
                                            className="absolute -inset-2 w-[120%] h-[120%] cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <h3 className="text-2xl font-black tracking-tight">{colorName}</h3>
                            <p className="text-sm text-muted-foreground">Official color name identifier</p>
                        </div>
                    </div>
                </div>

                {/* Meaning Section */}
                <div className="lg:col-span-2 space-y-6">
                    {meaning && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Zap className="w-5 h-5" />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Psychology</h3>
                                    </div>
                                    <p className="text-xl font-medium leading-relaxed italic">"{meaning.psychology}"</p>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-primary/10">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Shield className="w-5 h-5" />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Symbolism</h3>
                                    </div>
                                    <p className="text-lg opacity-80">{meaning.symbolism}</p>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-linear-to-br from-amber-500/10 to-transparent border border-amber-500/20 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <Lightbulb className="w-5 h-5" />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Best Use Cases</h3>
                                    </div>
                                    <p className="text-lg font-medium">{meaning.bestFor}</p>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-amber-500/10">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <Heart className="w-5 h-5" />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Brand Perception</h3>
                                    </div>
                                    <p className="text-sm opacity-80 leading-relaxed">
                                        Colors significantly influence how consumers see a brand. Using this {colorName.toLowerCase()} tone effectively communicates reliability and {meaning.psychology.split(",")[0].toLowerCase()}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ColorToolLayout>
    );
}
