"use client";

import { useState } from "react";
import jwt from "jsonwebtoken";
import { ShieldCheck, Copy, Check, Eye, EyeOff, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToolLayout from "@/components/tools/ToolLayout";
import { toast } from "sonner";

export default function JwtTool() {
    const [token, setToken] = useState("");
    const [decoded, setDecoded] = useState(null);
    const [error, setError] = useState(null);
    const [showSecret, setShowSecret] = useState(false);
    const [secret, setSecret] = useState("secret");

    // Create state
    const [payloadStr, setPayloadStr] = useState(
        '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
    );
    const [headerStr, setHeaderStr] = useState(
        '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
    );
    const [newToken, setNewToken] = useState("");

    const decodeToken = (val) => {
        setToken(val);
        if (!val) {
            setDecoded(null);
            setError(null);
            return;
        }

        try {
            const decodedData = jwt.decode(val, { complete: true });
            if (decodedData) {
                setDecoded(decodedData);
                setError(null);
            } else {
                throw new Error("Invalid JWT format");
            }
        } catch (err) {
            setError(err.message);
            setDecoded(null);
        }
    };

    const signToken = () => {
        try {
            const payload = JSON.parse(payloadStr);
            const token = jwt.sign(payload, secret);
            setNewToken(token);
            toast.success("Token generated successfully");
        } catch (err) {
            toast.error("Invalid payload JSON");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <ToolLayout
            title="JWT Tools"
            description="Decode, verify, and generate JSON Web Tokens (JWT)."
        >
            <Tabs defaultValue="decode" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="decode">Decode</TabsTrigger>
                    <TabsTrigger value="create">Create</TabsTrigger>
                </TabsList>

                <TabsContent value="decode" className="space-y-6 m-0">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Encoded JWT Token</Label>
                            <Textarea
                                placeholder="Paste your JWT here..."
                                className="font-mono h-32"
                                value={token}
                                onChange={(e) => decodeToken(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                Error: {error}
                            </div>
                        )}

                        {decoded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">
                                            Header
                                        </Label>
                                        <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-auto">
                                            {JSON.stringify(
                                                decoded.header,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">
                                            Payload
                                        </Label>
                                        <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-auto">
                                            {JSON.stringify(
                                                decoded.payload,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">
                                            Signature
                                        </Label>
                                        <div className="p-4 rounded-lg bg-muted font-mono text-sm break-all">
                                            {decoded.signature ||
                                                "No signature found"}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Token Info
                                        </h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>
                                                Algorithm:{" "}
                                                <span className="text-foreground">
                                                    {decoded.header.alg}
                                                </span>
                                            </li>
                                            <li>
                                                Type:{" "}
                                                <span className="text-foreground">
                                                    {decoded.header.typ}
                                                </span>
                                            </li>
                                            {decoded.payload.iat && (
                                                <li>
                                                    Issued At:{" "}
                                                    <span className="text-foreground">
                                                        {new Date(
                                                            decoded.payload
                                                                .iat * 1000,
                                                        ).toLocaleString()}
                                                    </span>
                                                </li>
                                            )}
                                            {decoded.payload.exp && (
                                                <li>
                                                    Expires At:{" "}
                                                    <span className="text-foreground">
                                                        {new Date(
                                                            decoded.payload
                                                                .exp * 1000,
                                                        ).toLocaleString()}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-6 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Payload (JSON)</Label>
                                <Textarea
                                    className="font-mono h-48"
                                    value={payloadStr}
                                    onChange={(e) =>
                                        setPayloadStr(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Secret / Private Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type={showSecret ? "text" : "password"}
                                        value={secret}
                                        onChange={(e) =>
                                            setSecret(e.target.value)
                                        }
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowSecret(!showSecret)
                                        }
                                    >
                                        {showSecret ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={signToken} className="w-full">
                                Generate JWT
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Resulting JWT</Label>
                                <div className="relative">
                                    <Textarea
                                        readOnly
                                        className="font-mono h-48 bg-muted/50"
                                        value={newToken}
                                    />
                                    {newToken && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() =>
                                                copyToClipboard(newToken)
                                            }
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {!newToken && (
                                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground opacity-50">
                                    <Terminal className="w-8 h-8 mb-2" />
                                    <p className="text-sm">
                                        Configure payload and secret to generate
                                        a token
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </ToolLayout>
    );
}
