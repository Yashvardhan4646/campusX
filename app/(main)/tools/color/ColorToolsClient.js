"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Palette,
    RefreshCw,
    Pipette,
    CheckCircle2,
    Layers,
    Eye,
    BookOpen,
    ShieldCheck,
} from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import Link from "next/link";
import { useState, useEffect } from "react";

const colorTools = [
    {
        title: "Color Picker & Palette",
        description: "Explore colors, generate palettes, and save your favorites.",
        icon: <Pipette className="w-5 h-5 text-pink-500" />,
        href: "/tools/color/picker",
        className: "md:col-span-2",
    },
    {
        title: "Universal Converter",
        description: "Convert between HEX, RGB, HSL, and CMYK instantly.",
        icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
        href: "/tools/color/convert",
        className: "md:col-span-1",
    },
    {
        title: "Contrast Checker",
        description: "Ensure your colors meet WCAG accessibility standards.",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        href: "/tools/color/contrast",
        className: "md:col-span-1",
    },
    {
        title: "Gradient Generator",
        description: "Create beautiful CSS gradients with live previews.",
        icon: <Layers className="w-5 h-5 text-purple-500" />,
        href: "/tools/color/gradient",
        className: "md:col-span-2",
    },
    {
        title: "Color Relationships",
        description: "Find complementary, triadic, and analogous colors.",
        icon: <Palette className="w-5 h-5 text-orange-500" />,
        href: "/tools/color/relationship",
        className: "md:col-span-1",
    },
    {
        title: "Blindness Simulator",
        description: "Visualize how colors appear to people with color blindness.",
        icon: <Eye className="w-5 h-5 text-indigo-500" />,
        href: "/tools/color/blindness",
        className: "md:col-span-1",
    },
    {
        title: "Color Meaning",
        description: "Discover the psychology and symbolism behind colors.",
        icon: <BookOpen className="w-5 h-5 text-rose-500" />,
        href: "/tools/color/meaning",
        className: "md:col-span-1",
    },
    {
        title: "Code Validator",
        description: "Validate HEX, RGB, and HSL codes for accuracy.",
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        href: "/tools/color/validator",
        className: "md:col-span-1",
    },
];

export default function ColorToolsClient() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ToolLayout
            title="Color Tools"
            description="Professional utilities for color selection, conversion, accessibility, and exploration."
        >
            <BentoGrid>
                {colorTools.map((tool, index) => (
                    <Link key={index} href={tool.href}>
                        <BentoGridItem
                            title={tool.title}
                            description={tool.description}
                            icon={tool.icon}
                            className={tool.className}
                        />
                    </Link>
                ))}
            </BentoGrid>
        </ToolLayout>
    );
}
