"use client"

import { useState, useEffect } from "react"
import { Keyboard as KeyboardIcon, Trash2, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"

export default function KeyboardTool() {
  const [lastEvent, setLastEvent] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for some keys to avoid scrolling/browser shortcuts while testing
      if (["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        // e.preventDefault() // Let's not prevent default to avoid breaking accessibility, just capture
      }

      const eventData = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        location: e.location,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        repeat: e.repeat,
        timestamp: Date.now()
      }

      setLastEvent(eventData)
      setHistory(prev => [eventData, ...prev].slice(0, 10))
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const clearHistory = () => {
    setHistory([])
    setLastEvent(null)
  }

  return (
    <ToolLayout 
      title="Keyboard Info" 
      description="Live capture and visualization of keyboard events, codes, and states."
    >
      <div className="space-y-8">
        {!lastEvent ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl animate-pulse">
            <KeyboardIcon className="w-16 h-16 text-primary mb-4 opacity-20" />
            <p className="text-xl font-bold text-muted-foreground">Press any key to start capturing...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center text-center shadow-xl shadow-primary/20">
                <span className="text-sm font-medium opacity-70 mb-2 uppercase tracking-widest">Pressed Key</span>
                <h2 className="text-7xl font-black tracking-tighter">
                  {lastEvent.key === " " ? "Space" : lastEvent.key}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Code", value: lastEvent.code },
                  { label: "Key Code", value: lastEvent.keyCode },
                  { label: "Which", value: lastEvent.which },
                  { label: "Location", value: lastEvent.location }
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl border bg-muted/50 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-mono text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Ctrl", active: lastEvent.ctrlKey },
                  { label: "Shift", active: lastEvent.shiftKey },
                  { label: "Alt", active: lastEvent.altKey },
                  { label: "Meta", active: lastEvent.metaKey },
                  { label: "Repeat", active: lastEvent.repeat }
                ].map(mod => (
                  <div 
                    key={mod.label} 
                    className={`px-4 py-2 rounded-lg border font-bold text-sm transition-all duration-300 ${
                      mod.active 
                        ? "bg-primary border-primary text-primary-foreground scale-105" 
                        : "bg-muted text-muted-foreground opacity-40"
                    }`}
                  >
                    {mod.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-bold">History</Label>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="space-y-2">
                {history.map((ev, i) => (
                  <div 
                    key={ev.timestamp} 
                    className={`p-3 rounded-lg border flex justify-between items-center animate-in slide-in-from-right-4 duration-300`}
                    style={{ opacity: 1 - (i * 0.1) }}
                  >
                    <span className="font-mono font-bold">{ev.key === " " ? "Space" : ev.key}</span>
                    <span className="text-xs text-muted-foreground font-mono">{ev.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-muted/30 border text-sm text-muted-foreground flex items-center gap-3">
          <MousePointer2 className="w-4 h-4" />
          Note: Some browser shortcuts (like Ctrl+N or F12) may still trigger default browser behavior.
        </div>
      </div>
    </ToolLayout>
  )
}
