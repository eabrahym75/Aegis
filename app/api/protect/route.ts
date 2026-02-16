import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const creator = (formData.get("creator") as string) || "Aegis User";
        const level = (formData.get("level") as string) || "standard";
        const useFgsm = (formData.get("fgsm") as string) === "true";
        const useC2pa = (formData.get("c2pa") as string) === "true";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create temporary directory for processing
        const tempDir = path.join(os.tmpdir(), "aegis-" + uuidv4());
        await fs.mkdir(tempDir, { recursive: true });

        const inputPath = path.join(tempDir, "input-" + file.name);
        const outputPath = path.join(tempDir, "output-" + file.name);

        // Write buffer to temporary file
        await fs.writeFile(inputPath, buffer);

        // Build command with optional flags
        const pythonPath = process.env.PYTHON_PATH || path.join(process.cwd(), ".venv", "bin", "python3");
        const pythonScriptPath = path.join(process.cwd(), "backend", "aegis_shield.py");
        let command = `"${pythonPath}" "${pythonScriptPath}" "${inputPath}" --output "${outputPath}" --creator "${creator}" --level "${level}"`;
        if (useFgsm) command += " --fgsm";
        if (useC2pa) command += " --c2pa";

        try {
            const { stdout, stderr } = await execAsync(command);
            console.log("Python stdout:", stdout);
            if (stderr) console.error("Python stderr:", stderr);

            // Check for potential output files (jpg or png)
            let actualOutputPath = outputPath;
            let mimeType = "image/jpeg";
            let extension = "jpg";

            try {
                await fs.access(outputPath);
            } catch {
                // If default output path doesn't exist, check for PNG (stealth mode)
                const pngPath = outputPath.replace(path.extname(outputPath), ".png");
                try {
                    await fs.access(pngPath);
                    actualOutputPath = pngPath;
                    mimeType = "image/png";
                    extension = "png";
                } catch {
                    throw new Error("Output file not found");
                }
            }

            // Read the processed image
            const processedBuffer = await fs.readFile(actualOutputPath);

            // Cleanup
            await fs.rm(tempDir, { recursive: true, force: true });

            const originalName = file.name.replace(/\.[^/.]+$/, "");

            return new NextResponse(processedBuffer as unknown as BodyInit, {
                headers: {
                    "Content-Type": mimeType,
                    "Content-Disposition": `attachment; filename="protected-${originalName}.${extension}"`,
                },
            });

        } catch (execError: any) {
            console.error("Python Execution Error:", execError);
            // Cleanup on error
            await fs.rm(tempDir, { recursive: true, force: true });
            return NextResponse.json(
                { error: "Image processing failed at engine level", details: execError.stderr },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Failed to process image" },
            { status: 500 }
        );
    }
}
