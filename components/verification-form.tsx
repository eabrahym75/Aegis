"use client";

import { useState, useRef } from "react";
import { Upload, Shield, Image as ImageIcon, CheckCircle, XCircle, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function VerificationForm() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<{ protected: boolean; aegisId?: string; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null); // Reset result on new file
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null);
        }
    };

    const handleVerify = async () => {
        if (!file) return;

        setIsVerifying(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Verification failed");

            const data = await response.json();
            setResult(data);

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to verify image. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Upload Area */}
                <div className="space-y-6">
                    <div
                        className={cn(
                            "relative overflow-hidden group rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer aspect-square flex flex-col items-center justify-center",
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
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110 pointer-events-none"
                                    style={{ backgroundImage: `url(${previewUrl})` }}
                                />
                                
                                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
                                    />
                                    
                                    {/* Laser Scan Animation */}
                                    {isVerifying && (
                                        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                                            <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_2px_rgba(99,102,241,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-20 animate-[scan-glow_2s_ease-in-out_infinite]" />
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center backdrop-blur-sm">
                                    <p className="text-white font-medium flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-white/10">
                                        <ImageIcon className="w-4 h-4 text-indigo-400" /> Change Image
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 text-center p-6 relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white">Scan for Aegis-ID</h3>
                                    <p className="text-slate-400 text-sm">
                                        Drag & drop or click to browse
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="space-y-6">
                    <Card className="border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-xl relative overflow-hidden h-full min-h-[300px] flex flex-col">
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-[30px] rounded-full pointer-events-none" />
                        
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <Search className="w-5 h-5 text-indigo-400" />
                                Verification Status
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Identifying hidden protection signatures...
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col items-center justify-center py-8">
                            {!result ? (
                                <div className="text-center space-y-4">
                                    <div className="p-4 bg-slate-950/40 rounded-full inline-block border border-white/5">
                                        <Shield className={cn("w-10 h-10 transition-colors", isVerifying ? "text-indigo-500 animate-pulse" : "text-slate-600")} />
                                    </div>
                                    <p className="text-slate-500 text-sm max-w-[200px]">
                                        {isVerifying ? "Analyzing pixel layer integrity..." : "Upload an image to start high-fidelity pixel scan."}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className={cn(
                                        "flex flex-col items-center gap-4 p-8 rounded-2xl border text-center relative overflow-hidden group",
                                        result.protected 
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100" 
                                            : "bg-rose-500/10 border-rose-500/30 text-rose-100"
                                    )}>
                                        {/* Animated background glow */}
                                        <div className={cn(
                                            "absolute inset-0 opacity-20 blur-2xl -z-10 animate-pulse",
                                            result.protected ? "bg-emerald-500" : "bg-rose-500"
                                        )} />

                                        {result.protected ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 animate-pulse" />
                                                <CheckCircle className="w-16 h-16 text-emerald-400 relative z-10" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-rose-500 blur-lg opacity-50 animate-pulse" />
                                                <XCircle className="w-16 h-16 text-rose-400 relative z-10" />
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black uppercase tracking-tighter">
                                                {result.protected ? "Protected" : "Not Protected"}
                                            </h4>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                result.protected ? "text-emerald-300/80" : "text-rose-300/80"
                                            )}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>

                                    {result.aegisId && (
                                        <div className="p-5 bg-slate-950/60 rounded-xl border border-indigo-500/20 space-y-3 shadow-inner">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                                                <Hash className="w-3 h-3" /> Aegis ID Signature
                                            </div>
                                            <div className="text-sm font-mono text-indigo-100 break-all bg-indigo-500/10 p-3 rounded border border-indigo-500/10 select-all">
                                                {result.aegisId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="pt-4 pb-6">
                            {!result ? (
                                <Button
                                    size="lg"
                                    className="w-full h-14 font-black text-lg uppercase tracking-wider shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 transition-all disabled:bg-slate-800"
                                    onClick={handleVerify}
                                    disabled={!file || isVerifying}
                                    tooltip="Stealth: High-speed verification mode."
                                >
                                    {isVerifying ? (
                                        <span className="flex items-center gap-2">
                                            <Search className="w-5 h-5 animate-spin" /> Scanning...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Shield className="w-5 h-5" /> Start Scan
                                        </span>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                                    onClick={handleReset}
                                >
                                    Scan Another Image
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0; }
                    5%, 95% { opacity: 1; }
                    50% { top: 100%; }
                }
                @keyframes scan-glow {
                    0%, 100% { top: -10%; opacity: 0; }
                    50% { top: 90%; opacity: 1; }
                }
            `}</style>
        </div>
    );
}
