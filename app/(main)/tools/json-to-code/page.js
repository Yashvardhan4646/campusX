"use client"

import { useState, useEffect } from "react"
import JsonToTS from "json-to-ts"
import { Code2, Copy, Trash2, Braces, FileJson, AlertCircle, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function JsonToCodeTool() {
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "Leanne Graham",\n  "username": "Bret",\n  "email": "Sincere@april.biz",\n  "address": {\n    "street": "Kulas Light",\n    "suite": "Apt. 556",\n    "city": "Gwenborough",\n    "zipcode": "92998-3874"\n  },\n  "phone": "1-770-736-8031 x56442",\n  "website": "hildegard.org",\n  "company": {\n    "name": "Romaguera-Crona",\n    "catchPhrase": "Multi-layered client-server neural-net",\n    "bs": "harness real-time e-markets"\n  }\n}')
  const [output, setOutput] = useState("")
  const [target, setTarget] = useState("typescript")
  const [error, setError] = useState(null)

  const convertJsonToCode = (json) => {
    try {
      if (!json.trim()) {
        setOutput("")
        setError(null)
        return
      }

      const parsed = JSON.parse(json)
      
      if (target === "typescript") {
        const interfaces = JsonToTS(parsed)
        setOutput(interfaces.join("\n\n"))
      } else if (target === "proptypes") {
        // Simple PropTypes generation (basic)
        const generatePropTypes = (obj) => {
          let res = "import PropTypes from 'prop-types';\n\nconst MyComponent = {\n"
          Object.entries(obj).forEach(([key, val]) => {
            let type = typeof val
            if (Array.isArray(val)) type = "array"
            else if (val === null) type = "any"
            else if (type === "object") type = "shape({})"
            
            res += `  ${key}: PropTypes.${type},\n`
          })
          res += "};"
          return res
        }
        setOutput(generatePropTypes(parsed))
      } else if (target === "flow") {
        const interfaces = JsonToTS(parsed)
        setOutput("// @flow\n\n" + interfaces.join("\n\n").replace(/interface/g, "type"))
      }

      setError(null)
    } catch (e) {
      setError("Invalid JSON: " + e.message)
      setOutput("")
    }
  }

  useEffect(() => {
    convertJsonToCode(input)
  }, [input, target])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast.success("Code copied to clipboard")
  }

  return (
    <ToolLayout 
      title="JSON → Code Converter" 
      description="Instantly transform JSON objects into TypeScript interfaces, Flow types, or React PropTypes."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON Input
              </Label>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setInput("")}>
                <Trash2 className="w-3 h-3 mr-2" />
                Clear
              </Button>
            </div>
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[450px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder="Paste your JSON here..."
            />
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Generated {target.charAt(0).toUpperCase() + target.slice(1)}
              </Label>
              <div className="flex items-center gap-2">
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="h-8 w-32 text-xs font-bold uppercase tracking-wider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="proptypes">PropTypes</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!!error || !output}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative group">
               <Textarea 
                value={output}
                readOnly
                className="min-h-[450px] font-mono text-sm p-4 bg-muted/50 border-primary/20 focus-visible:ring-primary"
                placeholder="Types will appear here..."
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" onClick={copyToClipboard} disabled={!!error || !output}>
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl border bg-card/50 flex flex-col gap-2">
             <div className="flex items-center gap-2 text-blue-500">
                <Type className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase">Strongly Typed</h4>
             </div>
             <p className="text-[10px] text-muted-foreground">Automatically infer types for nested objects and arrays.</p>
          </div>
          <div className="p-4 rounded-xl border bg-card/50 flex flex-col gap-2">
             <div className="flex items-center gap-2 text-purple-500">
                <Braces className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase">Interface Detection</h4>
             </div>
             <p className="text-[10px] text-muted-foreground">Creates separate interfaces for nested object structures.</p>
          </div>
          <div className="p-4 rounded-xl border bg-card/50 flex flex-col gap-2">
             <div className="flex items-center gap-2 text-green-500">
                <Copy className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase">Instant Copy</h4>
             </div>
             <p className="text-[10px] text-muted-foreground">One-click copy for seamless integration into your codebase.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
