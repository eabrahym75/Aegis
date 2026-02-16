"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Shield, Download, Lock, Image as ImageIcon, CheckCircle, Smartphone, Eye, Zap, FileSignature, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export function ProtectionForm() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [creator, setCreator] = useState("");
    const [level, setLevel] = useState<"standard" | "stealth" | "ultra">("standard");
    const [consent, setConsent] = useState(false);
    const [useFgsm, setUseFgsm] = useState(false);
    const [useC2pa, setUseC2pa] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [processedName, setProcessedName] = useState<string>("");
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setProcessedUrl(null); // Reset on new file
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleProtect = async () => {
        if (!file || !consent) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("creator", creator);
        formData.append("level", level);
        formData.append("fgsm", useFgsm ? "true" : "false");
        formData.append("c2pa", useC2pa ? "true" : "false");

        try {
            const response = await fetch("/api/protect", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Processing failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Determine result extension based on level
            const isPng = level === "stealth" || level === "ultra";
            const ext = isPng ? "png" : "jpg";
            const name = `protected-${file.name.replace(/\.[^/.]+$/, "")}.${ext}`;

            setProcessedUrl(url);
            setProcessedName(name);

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to protect image. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedUrl) return;
        const a = document.createElement("a");
        a.href = processedUrl;
        a.download = processedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setProcessedUrl(null);
        setCreator("");
        setConsent(false);
        setUseFgsm(false);
        setUseC2pa(false);
    };

    // Automatically enable FGSM and C2PA based on protection level
    useEffect(() => {
        if (level === "stealth") {
            setUseFgsm(false);
            setUseC2pa(true);
        } else if (level === "ultra") {
            setUseFgsm(true);
            setUseC2pa(true);
        } else {
            setUseFgsm(false);
            setUseC2pa(false);
        }
    }, [level]);

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Column: Upload Area */}
                <div className="space-y-6">
                    <div
                        className={cn(
                            "relative overflow-hidden group rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer h-[500px] flex flex-col items-center justify-center",
                            file
                                ? "border-indigo-500/50 bg-slate-900/50"
                                : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-900/50 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {previewUrl ? (
                            <>
                                {/* Background blur effect for filled state */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110 pointer-events-none"
                                    style={{ backgroundImage: `url(${previewUrl})` }}
                                />

                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="relative z-10 w-full h-full object-contain p-8 drop-shadow-2xl"
                                />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-sm">
                                    <p className="text-white font-medium flex items-center gap-2 bg-slate-900/80 px-6 py-3 rounded-full border border-white/10">
                                        <ImageIcon className="w-5 h-5 text-indigo-400" /> Replace Image
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6 text-center p-8 relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="w-10 h-10 text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Upload Source File</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto text-base">
                                        Drag & drop or click to browse
                                    </p>
                                    <p className="text-xs text-indigo-300/60 font-mono mt-4 border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                                        JPG • PNG • WEBP • HEIC
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="space-y-6">
                    <Card className="border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

                        <CardHeader className="pb-8">
                            <CardTitle className="flex items-center gap-3 text-2xl text-white">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Shield className="w-6 h-6 text-indigo-400" />
                                </div>
                                Security Configuration
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-base">
                                Configure the protection layers for your asset.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            <div className="space-y-4">
                                <Label htmlFor="creator" className="text-base font-medium text-slate-200 flex justify-between items-center">
                                    Owner Identity
                                    <span className="text-xs text-slate-500 font-normal">Optional</span>
                                </Label>
                                <div className="space-y-2">
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="p-1.5 rounded-md bg-slate-800/50 group-focus-within:bg-indigo-500/10 transition-colors">
                                                <ImageIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                                            </div>
                                        </div>
                                        <Input
                                            id="creator"
                                            placeholder="Enter your name or handle..."
                                            value={creator}
                                            onChange={(e) => setCreator(e.target.value)}
                                            className="pl-14 h-14 text-base bg-slate-950/40 border-white/5 hover:border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 px-1">
                                        <Lock className="w-3.5 h-3.5 mt-0.5 text-indigo-400/70" />
                                        <p className="text-xs text-slate-500 leading-snug max-w-sm">
                                            This identity will be permanently embedded into the image&apos;s invisible EXIF metadata (Copyright & Artist fields).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base text-slate-200">Protection Tier</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "standard", label: "Standard", desc: "Metadata only" },
                                        { id: "stealth", label: "Stealth", desc: "Ghost Layer" },
                                        { id: "ultra", label: "Ultra", desc: "Anti-AI Noise" }
                                    ].map((tier) => (
                                        <button
                                            key={tier.id}
                                            type="button"
                                            onClick={() => setLevel(tier.id as any)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1",
                                                level === tier.id
                                                    ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]"
                                                    : "bg-slate-950/40 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-bold",
                                                level === tier.id ? "text-indigo-400" : "text-slate-300"
                                            )}>{tier.label}</span>
                                            <span className="text-[10px] text-slate-500 leading-tight">{tier.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {(level === "stealth" || level === "ultra") && (
                                    <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                        <Smartphone className="w-3 h-3" />
                                        <span>Output will be <strong className="border-b border-dashed border-amber-400/50 cursor-help relative group">
                                            PNG
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl text-slate-300 text-xs font-normal shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                                <span className="font-bold text-amber-400 block mb-1">Why PNG?</span>
                                                High-quality PNGs preserve every pixel, whereas standard JPEGs &apos;smudge&apos; data and can break your invisible armor.
                                            </span>
                                        </strong> to preserve hidden Ghost Layer data.</span>
                                    </p>
                                )}
                            </div>

                            {/* Advanced Protections */}
                            <div className="space-y-3">
                                <Label className="text-base text-slate-200">Advanced Protections</Label>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                        <Checkbox
                                            id="fgsm"
                                            checked={useFgsm}
                                            onCheckedChange={(checked) => setUseFgsm(checked as boolean)}
                                            className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <Label htmlFor="fgsm" className="text-sm font-medium leading-none text-slate-200 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                AI-Proof Shield (FGSM)
                                            </Label>
                                            <p className="text-xs text-slate-500">
                                                Adds adversarial noise to deter AI manipulation.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                        <Checkbox
                                            id="c2pa"
                                            checked={useC2pa}
                                            onCheckedChange={(checked) => setUseC2pa(checked as boolean)}
                                            className="mt-0.5 border-white/20 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <Label htmlFor="c2pa" className="text-sm font-medium leading-none text-slate-200 flex items-center gap-2">
                                                <FileSignature className="w-4 h-4 text-teal-400" />
                                                Digital Signature (C2PA)
                                            </Label>
                                            <p className="text-xs text-slate-500">
                                                Embeds a verifiable content provenance manifest.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-4 border-t border-white/10">
                                <Checkbox
                                    id="consent"
                                    checked={consent}
                                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                                    className="mt-1 border-white/20 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="consent"
                                        className="text-sm font-medium leading-none text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group relative w-fit"
                                    >
                                        I own this image and prohibit AI manipulation

                                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl text-slate-300 text-xs font-normal shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                            <div className="font-bold text-indigo-400 mb-1 flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Ethical Use Policy
                                            </div>
                                            Applying Ultra-tier protection to someone else&apos;s media without consent is a violation of our Ethical Use Policy.
                                        </div>
                                    </Label>
                                    <p className="text-xs text-slate-500">
                                        You certify that you have the right to apply these protections.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 pb-8 flex flex-col gap-4">
                            {!processedUrl ? (
                                <Button
                                    size="lg"
                                    className="w-full h-16 text-lg font-bold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    onClick={handleProtect}
                                    disabled={!file || !consent || isProcessing}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2 animate-pulse">
                                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                            Processing Protocol...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Shield className="w-5 h-5" /> Execute Protection
                                        </span>
                                    )}
                                </Button>
                            ) : (
                                <div className="w-full space-y-3 animate-in zoom-in-95 duration-300">
                                    <Button
                                        size="lg"
                                        variant="default"
                                        className="w-full h-16 text-lg font-bold bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20 transition-all"
                                        onClick={handleDownload}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Download className="w-6 h-6" /> Download Protected Asset
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-400 hover:text-white"
                                        onClick={handleReset}
                                    >
                                        Protect Another Image
                                    </Button>

                                    <div className="flex justify-center pt-2">
                                        <button
                                            onClick={() => setIsDisclaimerOpen(true)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1.5 transition-colors"
                                        >
                                            <Info className="w-3 h-3" />
                                            Safety Disclaimer & Technical Details
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Safety Disclaimer Modal */}
                    {isDisclaimerOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsDisclaimerOpen(false)} />
                            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="p-6 border-b border-white/10 flex items-start justify-between bg-slate-900/50 rounded-t-2xl">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-indigo-400" />
                                            Safety & Technical Disclaimer
                                        </h3>
                                        <p className="text-sm text-slate-400">Understanding your protection layers</p>
                                    </div>
                                    <button
                                        onClick={() => setIsDisclaimerOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-8 text-slate-300 text-sm leading-relaxed">

                                    {/* Tiers Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Protection Tiers Explained
                                        </h4>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                                <div className="font-bold text-slate-200 mb-1">Standard</div>
                                                <p className="text-xs text-slate-400">Best for private storage. Adds a &quot;Do Not AI Train&quot; tag (metadata) that is usually removed if uploaded to social media.</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                                <div className="font-bold text-indigo-300 mb-1">Stealth</div>
                                                <p className="text-xs text-slate-400">Best for social media. Hides an invisible signature in the pixels that stays attached even if shared or screenshotted.</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                                <div className="font-bold text-amber-400 mb-1">Ultra</div>
                                                <p className="text-xs text-slate-400">Best for maximum privacy. Physically scrambles AI &quot;vision&quot; to block bots from digitally altering your image.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata vs Physical */}
                                    <div className="space-y-2">
                                        <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                            Metadata vs. Physical Protection
                                        </h4>
                                        <p>
                                            Digital &quot;tags&quot; (Metadata) are often stripped by social media platforms to save space. For images you plan to share publicly, we recommend <span className="text-indigo-300 font-medium">Stealth</span> or <span className="text-amber-400 font-medium">Ultra</span> tiers. These &quot;burn&quot; the protection into the pixels themselves, making the armor much harder to remove.
                                        </p>
                                    </div>

                                    {/* Digital DNA */}
                                    <div className="space-y-2">
                                        <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            The Digital DNA
                                        </h4>
                                        <p>
                                            By choosing a tier, you are asserting your right to bodily autonomy. Our Ultra tier uses adversarial noise to confuse AI scrapers, while Stealth uses a &quot;Ghost Layer&quot; to track your ownership.
                                        </p>
                                    </div>

                                    {/* Human Centric */}
                                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-indigo-400" />
                                            Human-Centric Design
                                        </h4>
                                        <p>
                                            We do not store your data. This tool is designed to give you &quot;the armor&quot; before you step into the public digital space. You are responsible for choosing the tier that matches your risk level.
                                        </p>
                                    </div>

                                </div>
                                <div className="p-6 border-t border-white/10 bg-slate-900/50 rounded-b-2xl flex justify-end">
                                    <Button onClick={() => setIsDisclaimerOpen(false)} variant="secondary">
                                        Understood
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900/40 rounded-xl p-5 border border-white/5 space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Protection Verified
                        </h4>
                        <ul className="text-sm text-slate-400 space-y-2 pl-6 list-disc marker:text-slate-600">
                            <li>Ownership metadata permanently embedded</li>
                            <li>Deters AI scrapers and casual theft</li>
                            <li>Zero-knowledge processing (no server storage)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
