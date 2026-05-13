"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";

export default function MetaTagChecker() {
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
        
        const checks = {
            title: {
                present: false,
                content: "",
                length: 0,
                status: "missing",
                message: ""
            },
            description: {
                present: false,
                content: "",
                length: 0,
                status: "missing",
                message: ""
            },
            viewport: {
                present: false,
                status: "missing",
                message: ""
            },
            canonical: {
                present: false,
                href: "",
                status: "missing",
                message: ""
            },
            robots: {
                present: false,
                content: "",
                status: "missing",
                message: ""
            },
            ogTags: {
                title: false,
                description: false,
                image: false,
                type: false,
                url: false,
                status: "missing",
                message: ""
            },
            twitterTags: {
                card: false,
                site: false,
                title: false,
                description: false,
                image: false,
                status: "missing",
                message: ""
            }
        };

        // Check title
        const titleEl = doc.querySelector("title");
        if (titleEl) {
            checks.title.present = true;
            checks.title.content = titleEl.textContent;
            checks.title.length = titleEl.textContent.length;
            if (checks.title.length === 0) {
                checks.title.status = "warning";
                checks.title.message = "Title tag is empty";
            } else if (checks.title.length > 60) {
                checks.title.status = "warning";
                checks.title.message = `Title is ${checks.title.length} characters (recommended: 50-60)`;
            } else {
                checks.title.status = "pass";
                checks.title.message = `Title is ${checks.title.length} characters (good length)`;
            }
        } else {
            checks.title.message = "Missing title tag";
        }

        // Check meta description
        const descEl = doc.querySelector('meta[name="description"]');
        if (descEl) {
            checks.description.present = true;
            checks.description.content = descEl.getAttribute("content") || "";
            checks.description.length = checks.description.content.length;
            if (checks.description.length === 0) {
                checks.description.status = "warning";
                checks.description.message = "Meta description is empty";
            } else if (checks.description.length < 120) {
                checks.description.status = "warning";
                checks.description.message = `Description is ${checks.description.length} characters (recommended: 120-160)`;
            } else if (checks.description.length > 160) {
                checks.description.status = "warning";
                checks.description.message = `Description is ${checks.description.length} characters (may be truncated at 160)`;
            } else {
                checks.description.status = "pass";
                checks.description.message = `Description is ${checks.description.length} characters (good length)`;
            }
        } else {
            checks.description.message = "Missing meta description";
        }

        // Check viewport
        const viewportEl = doc.querySelector('meta[name="viewport"]');
        if (viewportEl) {
            checks.viewport.present = true;
            checks.viewport.status = "pass";
            checks.viewport.message = "Viewport meta tag present";
        } else {
            checks.viewport.message = "Missing viewport meta tag (important for mobile)";
        }

        // Check canonical
        const canonicalEl = doc.querySelector('link[rel="canonical"]');
        if (canonicalEl) {
            checks.canonical.present = true;
            checks.canonical.href = canonicalEl.getAttribute("href") || "";
            checks.canonical.status = "pass";
            checks.canonical.message = "Canonical link present";
        } else {
            checks.canonical.message = "Missing canonical link (recommended to prevent duplicate content)";
        }

        // Check robots
        const robotsEl = doc.querySelector('meta[name="robots"]');
        if (robotsEl) {
            checks.robots.present = true;
            checks.robots.content = robotsEl.getAttribute("content") || "";
            checks.robots.status = "pass";
            checks.robots.message = `Robots directive: ${checks.robots.content}`;
        } else {
            checks.robots.message = "Missing robots meta tag (defaults to index,follow)";
        }

        // Check Open Graph tags
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        const ogDesc = doc.querySelector('meta[property="og:description"]');
        const ogImage = doc.querySelector('meta[property="og:image"]');
        const ogType = doc.querySelector('meta[property="og:type"]');
        const ogUrl = doc.querySelector('meta[property="og:url"]');

        checks.ogTags.title = !!ogTitle;
        checks.ogTags.description = !!ogDesc;
        checks.ogTags.image = !!ogImage;
        checks.ogTags.type = !!ogType;
        checks.ogTags.url = !!ogUrl;

        const ogCount = [ogTitle, ogDesc, ogImage, ogType, ogUrl].filter(Boolean).length;
        if (ogCount === 5) {
            checks.ogTags.status = "pass";
            checks.ogTags.message = "All basic Open Graph tags present";
        } else if (ogCount >= 3) {
            checks.ogTags.status = "warning";
            checks.ogTags.message = `Some Open Graph tags missing (${5 - ogCount} missing)`;
        } else {
            checks.ogTags.status = "missing";
            checks.ogTags.message = `Most Open Graph tags missing (${5 - ogCount} missing)`;
        }

        // Check Twitter Card tags
        const twitterCard = doc.querySelector('meta[name="twitter:card"]');
        const twitterSite = doc.querySelector('meta[name="twitter:site"]');
        const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
        const twitterDesc = doc.querySelector('meta[name="twitter:description"]');
        const twitterImage = doc.querySelector('meta[name="twitter:image"]');

        checks.twitterTags.card = !!twitterCard;
        checks.twitterTags.site = !!twitterSite;
        checks.twitterTags.title = !!twitterTitle;
        checks.twitterTags.description = !!twitterDesc;
        checks.twitterTags.image = !!twitterImage;

        const twitterCount = [twitterCard, twitterSite, twitterTitle, twitterDesc, twitterImage].filter(Boolean).length;
        if (twitterCount === 5) {
            checks.twitterTags.status = "pass";
            checks.twitterTags.message = "All basic Twitter Card tags present";
        } else if (twitterCount >= 3) {
            checks.twitterTags.status = "warning";
            checks.twitterTags.message = `Some Twitter Card tags missing (${5 - twitterCount} missing)`;
        } else {
            checks.twitterTags.status = "missing";
            checks.twitterTags.message = `Most Twitter Card tags missing (${5 - twitterCount} missing)`;
        }

        // Calculate score
        const allChecks = [
            checks.title.status === "pass",
            checks.description.status === "pass",
            checks.viewport.status === "pass",
            checks.canonical.status === "pass",
            checks.ogTags.status === "pass",
            checks.twitterTags.status === "pass"
        ];
        const passCount = allChecks.filter(Boolean).length;
        const score = Math.round((passCount / allChecks.length) * 100);

        setResults({ checks, score });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pass":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "warning":
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case "missing":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return { grade: "A", color: "text-green-500" };
        if (score >= 80) return { grade: "B", color: "text-emerald-500" };
        if (score >= 70) return { grade: "C", color: "text-amber-500" };
        if (score >= 60) return { grade: "D", color: "text-orange-500" };
        return { grade: "F", color: "text-red-500" };
    };

    if (!mounted) return null;

    return (
        <SeoToolLayout
            title="Meta Tag Checker"
            description="Audit HTML for missing or incomplete SEO meta tags."
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
                            placeholder="Paste your HTML here (include the <head> section)..."
                            rows={15}
                            className="font-mono text-sm"
                        />
                        <Button onClick={analyzeHtml} className="w-full">
                            Analyze Meta Tags
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {results && (
                        <>
                            <div className="p-6 rounded-2xl border border-border bg-card text-center">
                                <h3 className="text-lg font-bold mb-2">SEO Score</h3>
                                <div className={`text-6xl font-black ${getScoreGrade(results.score).color}`}>
                                    {getScoreGrade(results.score).grade}
                                </div>
                                <p className="text-muted-foreground text-sm mt-2">
                                    {results.score}% - {results.score >= 70 ? "Good" : "Needs Improvement"}
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Basic Meta Tags</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        {getStatusIcon(results.checks.title.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Title Tag</p>
                                            <p className="text-xs text-muted-foreground">{results.checks.title.message}</p>
                                            {results.checks.title.content && (
                                                <p className="text-xs font-mono mt-1 truncate">{results.checks.title.content}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        {getStatusIcon(results.checks.description.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Meta Description</p>
                                            <p className="text-xs text-muted-foreground">{results.checks.description.message}</p>
                                            {results.checks.description.content && (
                                                <p className="text-xs font-mono mt-1 truncate">{results.checks.description.content}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        {getStatusIcon(results.checks.viewport.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Viewport</p>
                                            <p className="text-xs text-muted-foreground">{results.checks.viewport.message}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        {getStatusIcon(results.checks.canonical.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Canonical URL</p>
                                            <p className="text-xs text-muted-foreground">{results.checks.canonical.message}</p>
                                            {results.checks.canonical.href && (
                                                <p className="text-xs font-mono mt-1 truncate">{results.checks.canonical.href}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        {getStatusIcon(results.checks.robots.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Robots Meta</p>
                                            <p className="text-xs text-muted-foreground">{results.checks.robots.message}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Open Graph Tags</h3>
                                
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    {getStatusIcon(results.checks.ogTags.status)}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">OG Completeness</p>
                                        <p className="text-xs text-muted-foreground">{results.checks.ogTags.message}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {results.checks.ogTags.title && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">og:title</span>}
                                            {results.checks.ogTags.description && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">og:description</span>}
                                            {results.checks.ogTags.image && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">og:image</span>}
                                            {results.checks.ogTags.type && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">og:type</span>}
                                            {results.checks.ogTags.url && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">og:url</span>}
                                            {!results.checks.ogTags.title && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">og:title</span>}
                                            {!results.checks.ogTags.description && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">og:description</span>}
                                            {!results.checks.ogTags.image && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">og:image</span>}
                                            {!results.checks.ogTags.type && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">og:type</span>}
                                            {!results.checks.ogTags.url && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">og:url</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Twitter Card Tags</h3>
                                
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    {getStatusIcon(results.checks.twitterTags.status)}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Twitter Card Completeness</p>
                                        <p className="text-xs text-muted-foreground">{results.checks.twitterTags.message}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {results.checks.twitterTags.card && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">twitter:card</span>}
                                            {results.checks.twitterTags.site && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">twitter:site</span>}
                                            {results.checks.twitterTags.title && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">twitter:title</span>}
                                            {results.checks.twitterTags.description && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">twitter:description</span>}
                                            {results.checks.twitterTags.image && <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">twitter:image</span>}
                                            {!results.checks.twitterTags.card && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">twitter:card</span>}
                                            {!results.checks.twitterTags.site && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">twitter:site</span>}
                                            {!results.checks.twitterTags.title && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">twitter:title</span>}
                                            {!results.checks.twitterTags.description && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">twitter:description</span>}
                                            {!results.checks.twitterTags.image && <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">twitter:image</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SeoToolLayout>
    );
}
