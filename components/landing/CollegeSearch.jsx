"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import { slugifyCollege } from "@/utils/formatters";

export default function CollegeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/community/${slugifyCollege(query)}`);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-black">
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Find Your Campus Tribe
        </h2>
        <p className="text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
          Search for your college and connect with your seniors, juniors, and batchmates instantly.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Enter your college name (e.g. IIT Bombay)..."
              className="pl-12 py-7 text-lg bg-neutral-900/50 border-neutral-800 focus:border-primary/50 text-white rounded-2xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
