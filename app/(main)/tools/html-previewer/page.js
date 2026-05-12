"use client"

import { useState, useEffect } from "react"
import { Monitor, Tablet, Smartphone, Code, Play, RefreshCw, Layout, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function HtmlPreviewerTool() {
  const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      text-align: center;
    }
    h1 { margin-top: 0; }
    button {
      background: white;
      color: #6366f1;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World</h1>
    <p>This is a live HTML preview.</p>
    <button onclick="alert('Magic!')">Click Me</button>
  </div>
</body>
</html>`

  const [html, setHtml] = useState(defaultHtml)
  const [viewMode, setViewMode] = useState("desktop")
  const [key, setKey] = useState(0) // Used to force iframe reload

  const refreshPreview = () => {
    setKey(prev => prev + 1)
    toast.success("Preview refreshed")
  }

  const viewWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  }

  return (
    <ToolLayout 
      title="HTML Previewer" 
      description="Real-time sandboxed preview for HTML and CSS. Test your snippets across different screen sizes."
    >
      <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] gap-6">
        {/* Toolbar */}
        <div className="p-4 rounded-2xl border bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <Button 
              variant={viewMode === "desktop" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-9 px-3 rounded-lg"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button 
              variant={viewMode === "tablet" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-9 px-3 rounded-lg"
              onClick={() => setViewMode("tablet")}
            >
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button 
              variant={viewMode === "mobile" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-9 px-3 rounded-lg"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshPreview} className="h-9 rounded-lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
            <Button size="sm" className="h-9 rounded-lg px-6">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-1 gap-6 overflow-hidden">
          {/* Editor */}
          <div className="flex flex-col rounded-2xl border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Code className="w-3 h-3" />
                HTML / CSS Editor
              </span>
            </div>
            <Textarea 
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="flex-1 font-mono text-sm p-4 bg-transparent border-none focus-visible:ring-0 resize-none overflow-y-auto"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col rounded-2xl border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Eye className="w-3 h-3" />
                Live Preview
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {viewMode === "desktop" ? "Fluid" : viewWidths[viewMode]}
              </span>
            </div>
            <div className="flex-1 bg-muted/20 flex items-center justify-center p-4 overflow-auto">
              <div 
                className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full"
                style={{ width: viewWidths[viewMode] }}
              >
                <iframe 
                  key={key}
                  srcDoc={html}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-modals"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-xl border bg-card/50 flex items-center gap-3">
              <Layout className="w-5 h-5 text-primary opacity-50" />
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Sandboxed</p>
                <p className="text-xs">Safe execution environment</p>
              </div>
           </div>
           {/* Add more info cards if needed */}
        </div>
      </div>
    </ToolLayout>
  )
}
