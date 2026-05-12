"use client"

import { useState, useEffect } from "react"
import { Type, Info, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ToolLayout from "@/components/tools/ToolLayout"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CssSpecificityTool() {
  const [selector, setSelector] = useState("header nav ul li.active a:hover")
  const [specificity, setSpecificity] = useState({ ids: 0, classes: 0, tags: 0 })

  const calculateSpecificity = (sel) => {
    if (!sel.trim()) {
      setSpecificity({ ids: 0, classes: 0, tags: 0 })
      return
    }

    // This is a simplified calculation logic
    let ids = (sel.match(/#[a-zA-Z0-9_-]+/g) || []).length
    let classes = (sel.match(/\.[a-zA-Z0-9_-]+/g) || []).length
    let pseudoClasses = (sel.match(/:[a-zA-Z0-9_-]+/g) || []).length
    let attributes = (sel.match(/\[[^\]]+\]/g) || []).length
    
    // Tags and pseudo-elements
    // Simplified: split by space/combinators and count parts that aren't ids/classes/pseudos
    const parts = sel.split(/[\s>+~]+/)
    let tags = 0
    parts.forEach(part => {
      // Remove ids, classes, pseudos, attributes
      const cleaned = part
        .replace(/#[a-zA-Z0-9_-]+/g, "")
        .replace(/\.[a-zA-Z0-9_-]+/g, "")
        .replace(/:[a-zA-Z0-9_-]+/g, "")
        .replace(/\[[^\]]+\]/g, "")
        .trim()
      
      if (cleaned && /^[a-zA-Z0-9]+$/.test(cleaned)) {
        tags++
      }
    })

    setSpecificity({ 
      ids, 
      classes: classes + pseudoClasses + attributes, 
      tags 
    })
  }

  useEffect(() => {
    calculateSpecificity(selector)
  }, [selector])

  return (
    <ToolLayout 
      title="CSS Specificity Checker" 
      description="Calculate the weight of your CSS selectors to understand which rules will take precedence."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex justify-between items-center">
              <span>CSS Selector</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Enter any valid CSS selector like <code className="bg-muted px-1 rounded">.nav ul li:hover</code></p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input 
              placeholder="e.g. .container #main-nav ul li.active" 
              className="font-mono text-lg py-6"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-[10px] uppercase font-black text-amber-600 mb-1 tracking-widest">ID Selectors</p>
            <h3 className="text-5xl font-black text-amber-600">{specificity.ids}</h3>
            <p className="text-xs text-amber-600/70 mt-2">Weight: 1-0-0</p>
          </div>
          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-[10px] uppercase font-black text-blue-600 mb-1 tracking-widest">Classes, Pseudos, Attrs</p>
            <h3 className="text-5xl font-black text-blue-600">{specificity.classes}</h3>
            <p className="text-xs text-blue-600/70 mt-2">Weight: 0-1-0</p>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[10px] uppercase font-black text-emerald-600 mb-1 tracking-widest">Elements & Pseudos</p>
            <h3 className="text-5xl font-black text-emerald-600">{specificity.tags}</h3>
            <p className="text-xs text-emerald-600/70 mt-2">Weight: 0-0-1</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center text-center shadow-xl shadow-primary/20">
          <span className="text-sm font-medium opacity-70 mb-2 uppercase tracking-widest">Total Specificity Score</span>
          <h2 className="text-5xl font-black tracking-tighter">
            {specificity.ids},{specificity.classes},{specificity.tags}
          </h2>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h4 className="font-bold flex items-center gap-2">
            <Info className="w-4 h-4" />
            How it works
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="font-bold text-foreground mb-1">Inline Styles</p>
              Always win (1-0-0-0). Not covered by selector specificity.
            </div>
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="font-bold text-foreground mb-1">!important</p>
              Overrides everything, regardless of specificity.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
