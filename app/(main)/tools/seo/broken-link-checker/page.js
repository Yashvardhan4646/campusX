"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Link as LinkIcon, FileCode, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SeoToolLayout from "@/components/tools/SeoToolLayout";

export default function BrokenLinkChecker() {
    const [html, setHtml] = useState("");
    const [results, setResults] = useState(null);
    const [checking, setChecking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const checkLinks = async () => {
        if (!html.trim()) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const links = Array.from(doc.querySelectorAll("a[href]"))
            .map((a) => a.getAttribute("href"))
            .filter((href) => href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:"))
            .filter((href, index, self) => self.indexOf(href) === index);

        if (links.length === 0) {
            setResults({ total: 0, links: [], alive: 0, dead: 0, unknown: 0 });
            return;
        }

        setChecking(true);
        setProgress(0);
        const linkResults = [];
        let alive = 0;
        let dead = 0;
        let unknown = 0;

        for (let i = 0; i < links.length; i++) {
            const url = links[i];
            setProgress(Math.round(((i + 1) / links.length) * 100));

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(url, {
                    method: "HEAD",
                    mode: "no-cors",
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // With no-cors mode, we can't read the status, so we assume it's reachable
                // unless it throws an error
                linkResults.push({
                    url,
                    status: "unknown",
                    statusCode: "CORS",
                    responseTime: 0,
                    message: "CORS restricted - status unknown",
                });
                unknown++;
            } catch (error) {
                if (error.name === "AbortError") {
                    linkResults.push({
                        url,
                        status: "unknown",
                        statusCode: "Timeout",
                        responseTime: 5000,
                        message: "Request timed out",
                    });
                    unknown++;
                } else {
                    linkResults.push({
                        url,
                        status: "dead",
                        statusCode: "Error",
                        responseTime: 0,
                        message: error.message,
                    });
                    dead++;
                }
            }

            // Small delay to avoid overwhelming the browser
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        setResults({
            total: links.length,
            links: linkResults,
            alive,
            dead,
            unknown,
        });
        setChecking(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "alive":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "dead":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "unknown":
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "alive":
                return <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">Alive</span>;
            case "dead":
                return <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">Dead</span>;
            case "unknown":
                return <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-500">Unknown</span>;
            default:
                return null;
        }
    };

    if (!mounted) return null;

    return (
        <SeoToolLayout
            title="Broken Link Checker"
            description="Check anchor tags for broken or unreachable links."
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
                            disabled={checking}
                        />
                        <Button onClick={checkLinks} className="w-full" disabled={checking || !html.trim()}>
                            {checking ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Checking Links...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Check Links
                                </>
                            )}
                        </Button>
                        {checking && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                            <strong>CORS Limitation:</strong> Browser-based link checking is restricted by CORS. Most URLs will return opaque responses and be marked as "Unknown" rather than definitively broken. For accurate results, use a server-side checker.
                        </p>
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
                                        <div className="text-xs text-muted-foreground">Total Links</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-green-500/10">
                                        <div className="text-3xl font-black text-green-500">{results.alive}</div>
                                        <div className="text-xs text-muted-foreground">Alive</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-red-500/10">
                                        <div className="text-3xl font-black text-red-500">{results.dead}</div>
                                        <div className="text-xs text-muted-foreground">Dead</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-amber-500/10">
                                        <div className="text-3xl font-black text-amber-500">{results.unknown}</div>
                                        <div className="text-xs text-muted-foreground">Unknown</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold">Link Details</h3>
                                
                                {results.links.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No links found in the HTML.
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                        {results.links.map((link, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-lg bg-muted/50 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-mono text-blue-500 hover:underline truncate"
                                                        >
                                                            {link.url}
                                                        </a>
                                                    </div>
                                                    {getStatusBadge(link.status)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(link.status)}
                                                        <span className="text-muted-foreground">
                                                            {link.statusCode}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {link.responseTime > 0 && `${link.responseTime}ms`}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {link.message}
                                                </p>
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
