"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { useTheme, PREMIUM_THEMES } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
    Plus, 
    Palette, 
    Trash2, 
    Check, 
    Edit, 
    X, 
    Download, 
    Upload, 
    Share2, 
    Star 
} from "lucide-react";
import { toast } from "sonner";

export default function CustomizePage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const { 
        theme, 
        setTheme, 
        customThemes = [], 
        addCustomTheme, 
        deleteCustomTheme,
        editCustomTheme 
    } = useTheme();

    const [isThemeReady, setIsThemeReady] = useState(false);
    useEffect(() => {
        if (theme !== undefined) {
            setIsThemeReady(true);
        }
    }, [theme]);

    const [editingThemeId, setEditingThemeId] = useState(null);
    const [newThemeName, setNewThemeName] = useState("");
    const [newThemePrimary, setNewThemePrimary] = useState("#4ba9e1");
    const [newThemeBg, setNewThemeBg] = useState("#ffffff");
    const [newThemeFg, setNewThemeFg] = useState("#0f172a");
    const [newThemeCard, setNewThemeCard] = useState("#f8fafc");
    const [newThemeCardFg, setNewThemeCardFg] = useState("#0f172a");
    const [newThemeMuted, setNewThemeMuted] = useState("#f1f5f9");
    const [newThemeMutedFg, setNewThemeMutedFg] = useState("#475569");
    const [newThemeAccent, setNewThemeAccent] = useState("#e2e8f0");
    const [newThemeAccentFg, setNewThemeAccentFg] = useState("#0f172a");
    const [newThemeBorder, setNewThemeBorder] = useState("#e2e8f0");

    const resetForm = () => {
        setEditingThemeId(null);
        setNewThemeName("");
        setNewThemePrimary("#4ba9e1");
        setNewThemeBg("#ffffff");
        setNewThemeFg("#0f172a");
        setNewThemeCard("#f8fafc");
        setNewThemeCardFg("#0f172a");
        setNewThemeMuted("#f1f5f9");
        setNewThemeMutedFg("#475569");
        setNewThemeAccent("#e2e8f0");
        setNewThemeAccentFg("#0f172a");
        setNewThemeBorder("#e2e8f0");
    };

    const handleEditTheme = (themeToEdit) => {
        setEditingThemeId(themeToEdit.id);
        setNewThemeName(themeToEdit.name);
        setNewThemePrimary(themeToEdit.colors.primary);
        setNewThemeBg(themeToEdit.colors.background);
        setNewThemeFg(themeToEdit.colors.foreground);
        setNewThemeCard(themeToEdit.colors.card);
        setNewThemeCardFg(themeToEdit.colors.cardForeground);
        setNewThemeMuted(themeToEdit.colors.muted);
        setNewThemeMutedFg(themeToEdit.colors.mutedForeground);
        setNewThemeAccent(themeToEdit.colors.accent);
        setNewThemeAccentFg(themeToEdit.colors.accentForeground);
        setNewThemeBorder(themeToEdit.colors.border);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newThemeName.trim()) return;

        if (editingThemeId) {
            editCustomTheme({
                id: editingThemeId,
                name: newThemeName.trim(),
                colors: {
                    primary: newThemePrimary,
                    background: newThemeBg,
                    foreground: newThemeFg,
                    card: newThemeCard,
                    cardForeground: newThemeCardFg,
                    muted: newThemeMuted,
                    mutedForeground: newThemeMutedFg,
                    accent: newThemeAccent,
                    accentForeground: newThemeAccentFg,
                    border: newThemeBorder,
                },
            });
        } else {
            addCustomTheme({
                id: Date.now().toString(),
                name: newThemeName.trim(),
                colors: {
                    primary: newThemePrimary,
                    background: newThemeBg,
                    foreground: newThemeFg,
                    card: newThemeCard,
                    cardForeground: newThemeCardFg,
                    muted: newThemeMuted,
                    mutedForeground: newThemeMutedFg,
                    accent: newThemeAccent,
                    accentForeground: newThemeAccentFg,
                    border: newThemeBorder,
                },
            });
        }

        resetForm();
    };

    const handleExportTheme = (themeToExport) => {
        const dataStr = JSON.stringify(themeToExport, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${themeToExport.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success("Theme exported successfully!");
    };

    const handleImportTheme = (event) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            try {
                const importedTheme = JSON.parse(e.target.result);
                if (!importedTheme.id || !importedTheme.name || !importedTheme.colors) {
                    throw new Error("Invalid theme file");
                }
                importedTheme.id = Date.now().toString();
                addCustomTheme(importedTheme);
                toast.success("Theme imported successfully!");
            } catch (error) {
                toast.error("Failed to import theme. Invalid file.");
            }
        };
        fileReader.readAsText(event.target.files[0]);
    };

    const handleShareTheme = async (themeToShare) => {
        const themeString = JSON.stringify(themeToShare);
        try {
            await navigator.clipboard.writeText(themeString);
            toast.success("Theme copied to clipboard! Share with friends!");
        } catch (error) {
            toast.error("Failed to copy theme to clipboard");
        }
    };

    useEffect(() => {
        if (!loading && (!user || !user.isPro)) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user || !isThemeReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!user.isPro) {
        return null;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">
                    Customize Your Theme
                </h1>
                <p className="text-muted-foreground">
                    Create, share, and manage custom themes for your CampusZen experience
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {/* Theme Form */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            {editingThemeId ? "Edit Theme" : "Create New Theme"}
                        </h2>
                        {editingThemeId && (
                            <Button variant="ghost" size="sm" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="themeName">Theme Name</Label>
                            <Input
                                id="themeName"
                                value={newThemeName}
                                onChange={(e) => setNewThemeName(e.target.value)}
                                placeholder="My Awesome Theme"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">
                                    Primary Color
                                </Label>
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={newThemePrimary}
                                    onChange={(e) => setNewThemePrimary(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bgColor">Background</Label>
                                <Input
                                    id="bgColor"
                                    type="color"
                                    value={newThemeBg}
                                    onChange={(e) => setNewThemeBg(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fgColor">Foreground</Label>
                                <Input
                                    id="fgColor"
                                    type="color"
                                    value={newThemeFg}
                                    onChange={(e) => setNewThemeFg(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardColor">Card</Label>
                                <Input
                                    id="cardColor"
                                    type="color"
                                    value={newThemeCard}
                                    onChange={(e) => setNewThemeCard(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardFgColor">
                                    Card Foreground
                                </Label>
                                <Input
                                    id="cardFgColor"
                                    type="color"
                                    value={newThemeCardFg}
                                    onChange={(e) => setNewThemeCardFg(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mutedColor">Muted</Label>
                                <Input
                                    id="mutedColor"
                                    type="color"
                                    value={newThemeMuted}
                                    onChange={(e) => setNewThemeMuted(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mutedFgColor">
                                    Muted Foreground
                                </Label>
                                <Input
                                    id="mutedFgColor"
                                    type="color"
                                    value={newThemeMutedFg}
                                    onChange={(e) => setNewThemeMutedFg(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accentColor">Accent</Label>
                                <Input
                                    id="accentColor"
                                    type="color"
                                    value={newThemeAccent}
                                    onChange={(e) => setNewThemeAccent(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accentFgColor">
                                    Accent Foreground
                                </Label>
                                <Input
                                    id="accentFgColor"
                                    type="color"
                                    value={newThemeAccentFg}
                                    onChange={(e) => setNewThemeAccentFg(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="borderColor">Border</Label>
                                <Input
                                    id="borderColor"
                                    type="color"
                                    value={newThemeBorder}
                                    onChange={(e) => setNewThemeBorder(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                {editingThemeId ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Theme
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Theme Selection & Presets */}
                <div className="space-y-6">
                    {/* Presets Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Premium Presets
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {PREMIUM_THEMES.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => {
                                        // Apply preset by adding as custom theme if not exists
                                        const existing = customThemes.find(t => t.id === preset.id);
                                        if (!existing) {
                                            addCustomTheme(preset);
                                        }
                                        setTheme(preset.id);
                                    }}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        theme === preset.id
                                            ? "border-primary"
                                            : "border-border hover:border-accent"
                                    }`}
                                >
                                    <div
                                        className="w-full h-16 rounded-md mb-2"
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.background})`,
                                        }}
                                    />
                                    <p className="font-medium">{preset.name}</p>
                                    {theme === preset.id && (
                                        <div className="flex items-center text-primary text-xs mt-1">
                                            <Check className="w-3 h-3 mr-1" />
                                            Active
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Default Themes */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Standard Themes</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === "light"
                                        ? "border-primary"
                                        : "border-border hover:border-accent"
                                }`}
                            >
                                <div
                                    className="w-full h-16 rounded-md mb-2"
                                    style={{
                                        background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
                                    }}
                                />
                                <p className="font-medium">Light</p>
                                {theme === "light" && (
                                    <div className="flex items-center text-primary text-xs mt-1">
                                        <Check className="w-3 h-3 mr-1" />
                                        Active
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === "dark"
                                        ? "border-primary"
                                        : "border-border hover:border-accent"
                                }`}
                            >
                                <div
                                    className="w-full h-16 rounded-md mb-2"
                                    style={{
                                        background: "linear-gradient(to bottom, #0a0a0a, #0f0f0f)",
                                    }}
                                />
                                <p className="font-medium">Dark</p>
                                {theme === "dark" && (
                                    <div className="flex items-center text-primary text-xs mt-1">
                                        <Check className="w-3 h-3 mr-1" />
                                        Active
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Custom Themes */}
                    {customThemes.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Your Custom Themes</h2>
                            <div className="space-y-3">
                                {customThemes.map((customTheme) => (
                                    <div key={customTheme.id} className="relative group">
                                        <button
                                            onClick={() => setTheme(customTheme.id)}
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                                                theme === customTheme.id
                                                    ? "border-primary"
                                                    : "border-border hover:border-accent"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg"
                                                        style={{
                                                            backgroundColor: customTheme.colors.primary,
                                                        }}
                                                    />
                                                    <div className="text-left">
                                                        <p className="font-medium">{customTheme.name}</p>
                                                        {theme === customTheme.id && (
                                                            <div className="flex items-center text-primary text-xs">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Active
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTheme(customTheme);
                                                }}
                                                className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportTheme(customTheme);
                                                }}
                                                className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600"
                                            >
                                                <Download className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShareTheme(customTheme);
                                                }}
                                                className="bg-purple-500 text-white rounded-full p-1 hover:bg-purple-600"
                                            >
                                                <Share2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteCustomTheme(customTheme.id);
                                                }}
                                                className="bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Import Button */}
                    <div className="pt-4">
                        <Label className="mb-2 block">Import Theme</Label>
                        <Input
                            type="file"
                            accept=".json"
                            onChange={handleImportTheme}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Import a theme JSON file shared by friends!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
