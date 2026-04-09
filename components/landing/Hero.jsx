"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let width = 0;
        let height = 0;
        let devicePixelRatio =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        // Wave configs (kept amplitude/frequency/offset style similar to original)
        const waves = [
            {
                amp: 60,
                freq: 0.008,
                speed: 0.9,
                color: "rgba(255,255,255,0.8)",
                offset: 0,
            },
            {
                amp: 45,
                freq: 0.01,
                speed: 1.1,
                color: "rgba(255,255,255,0.7)",
                offset: 100,
            },
            {
                amp: 35,
                freq: 0.013,
                speed: 1.4,
                color: "rgba(199,198,188,0.6)",
                offset: 200,
            },
            {
                amp: 80,
                freq: 0.004,
                speed: 0.7,
                color: "rgba(255,255,290,0.4)",
                offset: 300,
            },
            {
                amp: 25,
                freq: 0.02,
                speed: 1.8,
                color: "rgba(255,255,255,0.3)",
                offset: 400,
            },
        ];

        let t = 0;

        function resize() {
            devicePixelRatio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
            canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }

        function draw() {
            t += 1;
            ctx.clearRect(0, 0, width, height);

            // subtle background fill to avoid white flash
            ctx.fillStyle = "#0f0f0f";
            ctx.fillRect(0, 0, width, height);

            // mouse influence normalized
            const mx = (mouseRef.current.x / Math.max(width, 1) - 0.5) * 2;
            const my = (mouseRef.current.y / Math.max(height, 1) - 0.5) * 2;

            waves.forEach((w, i) => {
                ctx.beginPath();
                const { amp, freq, speed, color, offset } = w;
                const phase = t * 0.02 * speed + offset * 0.001;
                const baseline = height * (0.45 + i * 0.03) + my * 40;

                for (let x = 0; x <= width; x += 2) {
                    const px = x;
                    const y =
                        baseline +
                        Math.sin(x * freq + phase) * amp * (1 + mx * 0.2);
                    if (x === 0) ctx.moveTo(px, y);
                    else ctx.lineTo(px, y);
                }

                // create gradient stroke/fill for glow
                const g = ctx.createLinearGradient(0, 0, width, 0);
                g.addColorStop(0, color);
                g.addColorStop(1, color);
                ctx.strokeStyle = g;
                ctx.lineWidth = 2 + i * 0.6;
                ctx.globalAlpha = 0.9 - i * 0.12;
                ctx.stroke();

                // soft fill under the wave for glow
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.03 + i * 0.02;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            rafRef.current = requestAnimationFrame(draw);
        }

        function handleMove(e) {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        }

        function handleTouch(e) {
            if (!e.touches || !e.touches[0]) return;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.touches[0].clientX - rect.left;
            mouseRef.current.y = e.touches[0].clientY - rect.top;
        }

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchmove", handleTouch, { passive: true });

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("touchmove", handleTouch);
        };
    }, []);

    const container = {
        hidden: { opacity: 0, y: -10 },
        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
    };

    const item = {
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-[#0f0f0f]">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Glow blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-40 -top-32 w-96 h-96 rounded-full bg-[rgba(99,102,241,0.08)] blur-3xl" />
                <div className="absolute -right-32 top-20 w-96 h-96 rounded-full bg-[rgba(139,92,246,0.06)] blur-3xl" />
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-96 h-96 rounded-full bg-[rgba(59,130,246,0.04)] blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={container}
                    className="max-w-4xl mx-auto text-center"
                >
                                <motion.h1
                                    variants={item}
                                    className="text-4xl md:text-7xl lg:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl"
                                >
                                    India ka apna
                                    <span className="text-white">{' '}Student Social Network</span>
                                </motion.h1>

                                <motion.p
                                    variants={item}
                                    className="mx-auto mb-8 max-w-2xl text-lg text-white/70 md:text-xl drop-shadow-lg"
                                >
                                    Posts, chats, notes, code area — sab ek jagah. Sirf
                                    apne college waalon ke saath. Free. Forever.
                                </motion.p>

                    <motion.div
                        variants={item}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/signup" className="w-full sm:w-auto">
                                <Button className="group relative overflow-hidden gap-2 rounded-full px-8 text-base flex items-center justify-center bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[#0f0f0f]">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Join Free
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </span>
                                    {/* animated sheen */}
                                    <span aria-hidden className="absolute inset-0 z-0 pointer-events-none transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out">
                                        <span className="absolute inset-0 bg-linear-to-r from-white/30 via-white/60 to-white/30 opacity-60 blur-md mix-blend-screen" />
                                    </span>
                                    {/* shiny border */}
                                    <span aria-hidden className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
                                </Button>
                        </Link>

                        <Link href="#features" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="group gap-2 rounded-full px-8 text-base flex items-center justify-center border-white/10 text-[#f0f0f0] hover:cursor-pointer"
                            >
                                See How It Works
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
