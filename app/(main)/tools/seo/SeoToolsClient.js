"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Tags,
    SearchCheck,
    Share2,
    ImageIcon,
    Unlink,
    Link2,
    Code2,
} from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import Link from "next/link";
import { useState, useEffect } from "react";

const seoTools = [
    {
        title: "Meta Tag Generator",
        description: "Generate complete SEO meta tags with Open Graph and Twitter Card support.",
        icon: <Tags className="w-5 h-5 text-emerald-500" />,
        href: "/tools/seo/meta-tag-generator",
        className: "md:col-span-2",
    },
    {
        title: "Meta Tag Checker",
        description: "Audit HTML for missing or incomplete SEO meta tags.",
        icon: <SearchCheck className="w-5 h-5 text-blue-500" />,
        href: "/tools/seo/meta-tag-checker",
        className: "md:col-span-1",
    },
    {
        title: "Social Share Link Generator",
        description: "Generate share URLs for Twitter, Facebook, LinkedIn, and more.",
        icon: <Share2 className="w-5 h-5 text-pink-500" />,
        href: "/tools/seo/social-share",
        className: "md:col-span-1",
    },
    {
        title: "Alt Text Checker",
        description: "Audit images for missing or empty alt attributes for accessibility.",
        icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
        href: "/tools/seo/alt-text-checker",
        className: "md:col-span-2",
    },
    {
        title: "Broken Link Checker",
        description: "Check anchor tags for broken or unreachable links.",
        icon: <Unlink className="w-5 h-5 text-red-500" />,
        href: "/tools/seo/broken-link-checker",
        className: "md:col-span-1",
    },
    {
        title: "Slug Generator",
        description: "SEO-optimized slug generator with Google preview and keyword analysis.",
        icon: <Link2 className="w-5 h-5 text-violet-500" />,
        href: "/tools/seo/slug",
        className: "md:col-span-1",
    },
    {
        title: "HTML Tag Counter",
        description: "Analyze HTML tag frequency and heading hierarchy for SEO.",
        icon: <Code2 className="w-5 h-5 text-cyan-500" />,
        href: "/tools/seo/html-tag-counter",
        className: "md:col-span-2",
    },
];

export default function SeoToolsClient() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ToolLayout
            title="SEO Tools"
            description="Professional utilities for search engine optimization, meta tag auditing, and content analysis."
        >
            <BentoGrid>
                {seoTools.map((tool, index) => (
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
