"use client";

import React from "react";
import { FeatureCard } from "./FeatureCard";
import {
    Users,
    BookOpen,
    Code,
    MessageCircle,
    Layers,
    Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Collab with real students",
        icon: Users,
        description:
            "Growing community of verified students from IITs, NITs, and top colleges across India.",
    },
    {
        title: "Seprate Resources section",
        icon: BookOpen,
        description:
            "Free notes, PYQs, and coding materials uploaded by students — reviewed before going live.",
    },
    {
        title: "Collaborative Code Area",
        icon: Code,
        description:
            "Live collaborative code editor and execution environment for study groups and interview prep.",
    },
    {
        title: "Real-time Group Chats",
        icon: MessageCircle,
        description:
            "Powered by Pusher — instant messaging for study groups, communities, and campus circles.",
    },
    {
        title: "Real-time Whiteboard",
        icon: Layers,
        description:
            "Collaborative whiteboard with sticky notes, drawing tools, and synchronized cursors for group study.",
    },
    {
        title: "Communities",
        icon: Globe,
        description:
            "Join college, department, or interest-based communities to coordinate events and share resources.",
    },
];

const container = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
};

const item = {
    hidden: { opacity: 0, filter: "blur(6px)" },
    show: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.6 } },
};

function AnimatedContainer({ children }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
        >
            {children}
        </motion.div>
    );
}

export default function Features() {
    return (
        <section className="relative bg-[#0f0f0f] py-20">
            <div className="max-w-6xl mx-auto px-4">
                <AnimatedContainer>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-semibold text-[#f0f0f0]">
                            Everything your campus needs
                        </h2>
                        <p className="mt-2 text-[#f0f0f0]/70 max-w-2xl mx-auto">
                            Posts, notes, code area, chats — sab ek jagah.
                            Trusted by students across India.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border border-dashed border-[#2a2a2a] divide-y divide-x divide-dashed divide-[#2a2a2a]">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                variants={item}
                                className="p-6"
                            >
                                <FeatureCard
                                    title={f.title}
                                    description={f.description}
                                    icon={f.icon}
                                    index={i}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatedContainer>
            </div>
        </section>
    );
}
