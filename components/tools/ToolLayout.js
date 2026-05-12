"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolLayout({ title, description, children }) {
    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link href="/tools">
                    <Button
                        variant="ghost"
                        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Tools
                    </Button>
                </Link>
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {description}
                    </p>
                </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                {children}
            </div>
        </div>
    );
}
