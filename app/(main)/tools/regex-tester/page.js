"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Flag, Info, AlertCircle, CheckCircle2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function RegexTesterTool() {
  const [regex, setRegex] = useState("([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)")
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
    y: false,
  })
  const [testText, setTestText] = useState("Contact us at support@example.com or sales@company.org for more info.")
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([f]) => f)
      .join("")
  }, [flags])

  useEffect(() => {
    if (!regex) {
      setMatches([])
      setError(null)
      return
    }

    try {
      const re = new RegExp(regex, flagString)
      const allMatches = []
      let match
      
      if (flagString.includes('g')) {
        while ((match = re.exec(testText)) !== null) {
          allMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          if (match.index === re.lastIndex) re.lastIndex++
        }
      } else {
        match = re.exec(testText)
        if (match) {
          allMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }
      
      setMatches(allMatches)
      setError(null)
    } catch (e) {
      setError(e.message)
      setMatches([])
    }
  }, [regex, flagString, testText])

  const highlightedText = useMemo(() => {
    if (error || !regex || matches.length === 0) return testText

    let result = []
    let lastIndex = 0

    // Sort matches by index to handle them in order
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index)

    sortedMatches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        result.push(testText.substring(lastIndex, match.index))
      }
      // Add highlighted match
      result.push(
        <span key={`match-${i}`} className="bg-primary/30 border-b-2 border-primary text-foreground px-0.5 rounded-sm">
          {match.text}
        </span>
      )
      lastIndex = match.index + match.text.length
    })

    // Add remaining text
    if (lastIndex < testText.length) {
      result.push(testText.substring(lastIndex))
    }

    return result
  }, [testText, matches, error, regex])

  const copyRegex = () => {
    const fullRegex = `/${regex}/${flagString}`
    navigator.clipboard.writeText(fullRegex)
    toast.success("Regex copied to clipboard")
  }

  return (
    <ToolLayout 
      title="Regex Tester" 
      description="Live regular expression tester with real-time highlighting and match breakdown."
    >
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border bg-card space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Expression</Label>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={copyRegex}>
                  <Copy className="w-3 h-3 mr-2" />
                  Copy as JS Regex
                </Button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground font-mono">
                  /
                </div>
                <Input 
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  className={`pl-8 pr-12 font-mono h-12 text-lg ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  placeholder="Enter regex pattern..."
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground font-mono">
                  /{flagString}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Test String</Label>
              <div className="relative group">
                {/* Highlight layer */}
                <div className="absolute inset-0 p-4 font-mono text-sm pointer-events-none whitespace-pre-wrap break-all overflow-hidden opacity-100 transition-opacity">
                   <div className="text-transparent">
                    {highlightedText}
                   </div>
                </div>
                <Textarea 
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm p-4 relative z-10 bg-transparent focus-visible:ring-primary"
                  placeholder="Enter text to test against..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Search className="w-4 h-4" />
              Matches ({matches.length})
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {matches.length > 0 ? (
                matches.map((match, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary uppercase tracking-tighter">Match {i + 1}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">index: {match.index}</span>
                    </div>
                    <code className="text-sm break-all">{match.text}</code>
                    {match.groups.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-muted-foreground/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Groups</p>
                        <div className="grid grid-cols-1 gap-1">
                          {match.groups.map((group, gi) => (
                            <div key={gi} className="flex gap-2 text-xs">
                              <span className="text-muted-foreground font-mono">{gi + 1}:</span>
                              <code className="break-all">{group || "null"}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic text-sm">
                  No matches found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-card space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Flags
            </h3>
            <div className="space-y-4">
              {Object.entries({
                g: "Global (g) - Find all matches",
                i: "Case-insensitive (i)",
                m: "Multiline (m)",
                s: "Dotall (s) - . matches newlines",
                u: "Unicode (u)",
                y: "Sticky (y)",
              }).map(([flag, label]) => (
                <div key={flag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`flag-${flag}`} 
                    checked={flags[flag]}
                    onCheckedChange={(checked) => setFlags(f => ({ ...f, [flag]: !!checked }))}
                  />
                  <label 
                    htmlFor={`flag-${flag}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-4 h-4" />
              <h4 className="font-bold text-sm uppercase tracking-wider">Cheat Sheet</h4>
            </div>
            <div className="space-y-3">
              {[
                { char: ".", desc: "Any character except newline" },
                { char: "\\d", desc: "Any digit (0-9)" },
                { char: "\\w", desc: "Word character (a-z, A-Z, 0-9, _)" },
                { char: "\\s", desc: "Whitespace (space, tab, newline)" },
                { char: "[abc]", desc: "Any character in the set" },
                { char: "[^abc]", desc: "Any character NOT in the set" },
                { char: "a*", desc: "Zero or more of 'a'" },
                { char: "a+", desc: "One or more of 'a'" },
                { char: "a?", desc: "Zero or one of 'a'" },
                { char: "^", desc: "Start of string" },
                { char: "$", desc: "End of string" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <code className="bg-primary/10 px-1 rounded text-primary font-bold">{item.char}</code>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
