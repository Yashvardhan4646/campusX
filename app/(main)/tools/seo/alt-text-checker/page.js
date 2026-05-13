"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, ImageIcon, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";

export default function AltTextChecker() {
    const [html, setHtml] = useState("");
    const [results, setResults] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const analyzeHtml = () => {
        if (!html.trim()) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const images = doc.querySelectorAll("img");
        
        const imageResults = [];
        let withAlt = 0;
        let withoutAlt = 0;
        let emptyAlt = 0;

        images.forEach((img, index) => {
            const src = img.getAttribute("src") || "";
            const alt = img.getAttribute("alt");
            const hasAlt = img.hasAttribute("alt");
            
            let status = "missing";
            let suggestion = "";

            if (!hasAlt) {
                withoutAlt++;
                status = "missing";
                suggestion = "Add descriptive alt text for accessibility and SEO";
            } else if (alt === "") {
                emptyAlt++;
                status = "empty";
                suggestion = "Empty alt is okay for decorative images, but consider adding description if the image conveys meaning";
            } else {
                withAlt++;
                status = "pass";
                suggestion = "Good! Alt text is present";
            }

            imageResults.push({
                index,
                src,
                alt: alt || "",
                status,
                suggestion,
            });
        });

        const total = images.length;
        const percentage = total > 0 ? Math.round((withAlt / total) * 100) : 0;

        setResults({
            total,
            withAlt,
            withoutAlt,
            emptyAlt,
            percentage,
            images: imageResults,
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pass":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "empty":
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case "missing":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pass":
                return <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">Has Alt</span>;
            case "empty":
                return <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-500">Empty Alt</span>;
            case "missing":
                return <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">Missing</span>;
            default:
                return null;
        }
    };

    if (!mounted) return null;

    return (
        <SeoToolLayout
            title="Alt Text Checker"
            description="Audit images for missing or empty alt attributes for accessibility."
        >
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileCode className="w-5 h-5 text-muted-foreground" />
                            <h3 className="text-lg font-bold">Paste HTML</h3>
                        </div>
                        <Textarea
                            value={html}
                            onChange={(e) => setHtml(e.target.value)}
                            placeholder="Paste your HTML here..."
                            rows={15}
                            className="font-mono text-sm"
                        />
                        <Button onClick={analyzeHtml} className="w-full">
                            Check Alt Text
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {results && (
                        <>
                            <div className="p-6 rounded-2xl border border-border bg-card">
                                <h3 className="text-lg font-bold mb-4">Summary</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-muted/50">
                                        <div className="text-3xl font-black">{results.total}</div>
                                        <div className="text-xs text-muted-foreground">Total Images</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-green-500/10">
                                        <div className="text-3xl font-black text-green-500">{results.withAlt}</div>
                                        <div className="text-xs text-muted-foreground">With Alt</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-red-500/10">
                                        <div className="text-3xl font-black text-red-500">{results.withoutAlt}</div>
                                        <div className="text-xs text-muted-foreground">Missing Alt</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-amber-500/10">
                                        <div className="text-3xl font-black text-amber-500">{results.emptyAlt}</div>
                                        <div className="text-xs text-muted-foreground">Empty Alt</div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 rounded-xl bg-muted/50 text-center">
                                    <div className="text-sm text-muted-foreground">Accessibility Score</div>
                                    <div className={`text-4xl font-black ${results.percentage >= 80 ? "text-green-500" : results.percentage >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                        {results.percentage}%
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Image Details</h3>
                                
                                {results.images.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No images found in the HTML.
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                        {results.images.map((img) => (
                                            <div
                                                key={img.index}
                                                className="p-4 rounded-lg bg-muted/50 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                                                            {img.src || "[no src]"}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(img.status)}
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    {getStatusIcon(img.status)}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {img.alt ? `Alt: "${img.alt}"` : "No alt attribute"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {img.suggestion}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SeoToolLayout>
    );
}
