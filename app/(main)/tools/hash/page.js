"use client"

import { useState, useEffect } from "react"
import CryptoJS from "crypto-js"
import { Hash, Copy, Check, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

const HASH_ALGORITHMS = [
  { label: "MD5", value: "MD5" },
  { label: "SHA-1", value: "SHA1" },
  { label: "SHA-256", value: "SHA256" },
  { label: "SHA-512", value: "SHA512" },
  { label: "SHA-3", value: "SHA3" },
  { label: "RIPEMD-160", value: "RIPEMD160" }
]

export default function HashTool() {
  const [input, setInput] = useState("")
  const [algorithm, setAlgorithm] = useState("SHA256")
  const [isHmac, setIsHmac] = useState(false)
  const [secret, setSecret] = useState("")
  const [results, setResults] = useState({})
  const [copied, setCopied] = useState(null)

  const generateHashes = (val) => {
    const text = val || input
    if (!text) {
      setResults({})
      return
    }

    const newResults = {}
    
    if (isHmac) {
      if (!secret) return
      HASH_ALGORITHMS.forEach(algo => {
        try {
          newResults[algo.value] = CryptoJS[`Hmac${algo.value}`](text, secret).toString()
        } catch (e) {}
      })
    } else {
      HASH_ALGORITHMS.forEach(algo => {
        try {
          newResults[algo.value] = CryptoJS[algo.value](text).toString()
        } catch (e) {}
      })
    }
    
    setResults(newResults)
  }

  useEffect(() => {
    generateHashes()
  }, [input, isHmac, secret])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ToolLayout 
      title="Hash Generator" 
      description="Generate cryptographic hashes using various algorithms. Supports MD5, SHA-1, SHA-256, and HMAC."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Textarea 
              placeholder="Enter text to hash..." 
              className="font-mono h-32"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="hmac" 
                checked={isHmac} 
                onChange={(e) => setIsHmac(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="hmac" className="cursor-pointer">Enable HMAC</Label>
            </div>
            
            {isHmac && (
              <div className="flex-1 w-full space-y-2">
                <Input 
                  placeholder="HMAC Secret Key" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-6 border-t">
          {HASH_ALGORITHMS.map(algo => (
            <div key={algo.value} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-primary">{algo.label} {isHmac ? "(HMAC)" : ""}</Label>
                {results[algo.value] && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(results[algo.value], algo.value)}
                  >
                    {copied === algo.value ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                )}
              </div>
              <div className="p-3 rounded-lg bg-muted font-mono text-sm break-all min-h-[44px] flex items-center">
                {results[algo.value] || <span className="text-muted-foreground italic">Enter input to see hash...</span>}
              </div>
            </div>
          ))}
        </div>

        {!input && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-2xl opacity-50">
            <Shield className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">Type something above to generate hashes instantly.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
