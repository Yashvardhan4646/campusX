"use client"

import { useState, useEffect } from "react"
import semver from "semver"
import { Calculator, CheckCircle2, XCircle, Info, ArrowUpCircle, ArrowDownCircle, Equal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"

export default function SemverCalculatorTool() {
  const [version, setVersion] = useState("1.2.3")
  const [range, setRange] = useState("^1.0.0")
  const [comparison, setComparison] = useState({ v1: "1.2.3", v2: "2.0.0" })
  const [results, setResults] = useState({
    isValid: true,
    satisfies: true,
    parsed: null,
    inc: { major: "", minor: "", patch: "" },
    diff: "",
  })

  useEffect(() => {
    const isValid = semver.valid(version) !== null
    const satisfies = semver.satisfies(version, range)
    const parsed = semver.parse(version)
    const diff = semver.diff(comparison.v1, comparison.v2)

    setResults({
      isValid,
      satisfies,
      parsed,
      inc: {
        major: semver.inc(version, "major") || "",
        minor: semver.inc(version, "minor") || "",
        patch: semver.inc(version, "patch") || "",
      },
      diff: diff || "equal",
    })
  }, [version, range, comparison])

  const ComparisonIcon = () => {
    if (semver.gt(comparison.v1, comparison.v2)) return <ArrowUpCircle className="w-8 h-8 text-blue-500" />
    if (semver.lt(comparison.v1, comparison.v2)) return <ArrowDownCircle className="w-8 h-8 text-amber-500" />
    return <Equal className="w-8 h-8 text-green-500" />
  }

  return (
    <ToolLayout 
      title="Semver Calculator" 
      description="Parse, compare, and calculate semantic versions. Check ranges and increments instantly."
    >
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border bg-card space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Version</Label>
                <div className="relative">
                  <Input 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={`h-12 text-lg font-mono rounded-xl border-2 ${!results.isValid ? 'border-red-500' : ''}`}
                    placeholder="1.2.3"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {results.isValid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Range Check</Label>
                <Input 
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="h-12 text-lg font-mono rounded-xl border-2"
                  placeholder="^1.0.0"
                />
              </div>
            </div>

            {results.isValid && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Satisfies", value: results.satisfies ? "YES" : "NO", color: results.satisfies ? "text-green-500" : "text-red-500" },
                  { label: "Major", value: results.parsed?.major },
                  { label: "Minor", value: results.parsed?.minor },
                  { label: "Patch", value: results.parsed?.patch },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/50 border text-center space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                    <p className={`text-xl font-mono font-bold ${item.color || ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 rounded-3xl border bg-card space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Compare Versions
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Input 
                value={comparison.v1}
                onChange={(e) => setComparison(prev => ({ ...prev, v1: e.target.value }))}
                className="h-12 text-center font-mono text-lg rounded-xl"
              />
              <div className="shrink-0 flex flex-col items-center">
                 <ComparisonIcon />
                 <span className="text-[10px] font-bold uppercase mt-1 text-muted-foreground">{results.diff}</span>
              </div>
              <Input 
                value={comparison.v2}
                onChange={(e) => setComparison(prev => ({ ...prev, v2: e.target.value }))}
                className="h-12 text-center font-mono text-lg rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl border bg-card space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Next Versions</h3>
            <div className="space-y-3">
               {[
                 { label: "Major", value: results.inc.major },
                 { label: "Minor", value: results.inc.minor },
                 { label: "Patch", value: results.inc.patch },
               ].map((item, i) => (
                 <div key={i} className="p-4 rounded-2xl border bg-muted/30 flex justify-between items-center group hover:border-primary/50 transition-colors">
                    <span className="text-xs font-bold">{item.label}</span>
                    <code className="text-sm font-bold text-primary">{item.value || "---"}</code>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-violet-500/10 border border-violet-500/20 space-y-4">
             <div className="flex items-center gap-2 text-violet-500">
                <Info className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Semver Basics</h4>
             </div>
             <ul className="text-[11px] text-violet-200/70 space-y-2 list-disc pl-4">
                <li><b>^1.2.3</b>: Compatible with 1.x.x</li>
                <li><b>~1.2.3</b>: Compatible with 1.2.x</li>
                <li><b>1.2.x</b>: Any patch version in 1.2</li>
                <li><b>&gt;=1.2.3</b>: Version 1.2.3 or higher</li>
             </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
