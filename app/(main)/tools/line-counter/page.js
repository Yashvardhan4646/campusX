"use client"

import { useState, useEffect } from "react"
import { Hash, FileText, AlignLeft, Layers, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ToolLayout from "@/components/tools/ToolLayout"

export default function LineCounterTool() {
  const [input, setInput] = useState("")
  const [stats, setStats] = useState({
    lines: 0,
    words: 0,
    chars: 0,
    bytes: 0,
    emptyLines: 0
  })

  useEffect(() => {
    if (!input) {
      setStats({ lines: 0, words: 0, chars: 0, bytes: 0, emptyLines: 0 })
      return
    }

    const lines = input.split("\n")
    const words = input.trim().split(/\s+/).filter(w => w.length > 0)
    const emptyLines = lines.filter(l => l.trim().length === 0)

    setStats({
      lines: lines.length,
      words: words.length,
      chars: input.length,
      bytes: new Blob([input]).size,
      emptyLines: emptyLines.length
    })
  }, [input])

  return (
    <ToolLayout 
      title="Code Line Counter" 
      description="Analyze your code or text to get detailed statistics about lines, words, and characters."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Input Text / Code</Label>
            <Button variant="ghost" size="sm" onClick={() => setInput("")}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
          <Textarea 
            placeholder="Paste your code or text here..." 
            className="font-mono h-64 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Lines", value: stats.lines, icon: AlignLeft, color: "text-blue-500" },
            { label: "Words", value: stats.words, icon: FileText, color: "text-emerald-500" },
            { label: "Characters", value: stats.chars, icon: Hash, color: "text-amber-500" },
            { label: "Empty Lines", value: stats.emptyLines, icon: Layers, color: "text-violet-500" },
            { label: "Size (Bytes)", value: stats.bytes, icon: Layers, color: "text-rose-500" }
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl border bg-card flex flex-col items-center justify-center text-center space-y-2">
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-70`} />
              <h3 className="text-2xl font-black">{stat.value}</h3>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {input && (
          <div className="p-6 rounded-2xl bg-muted/30 border space-y-4">
            <h4 className="font-bold text-sm">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average characters per line:</span>
                <span className="font-mono font-bold">{(stats.chars / (stats.lines || 1)).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average words per line:</span>
                <span className="font-mono font-bold">{(stats.words / (stats.lines || 1)).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code density:</span>
                <span className="font-mono font-bold">{(100 - (stats.emptyLines / (stats.lines || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
