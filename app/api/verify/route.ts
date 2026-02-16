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

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create temporary directory for processing
        const tempDir = path.join(os.tmpdir(), "aegis-verify-" + uuidv4());
        await fs.mkdir(tempDir, { recursive: true });

        const inputPath = path.join(tempDir, "verify-" + file.name);

        // Write buffer to temporary file
        await fs.writeFile(inputPath, buffer);

        // Call Python script with --decode flag
        const pythonPath = process.env.PYTHON_PATH || path.join(process.cwd(), ".venv", "bin", "python3");
        const pythonScriptPath = path.join(process.cwd(), "backend", "aegis_shield.py");
        const command = `"${pythonPath}" "${pythonScriptPath}" "${inputPath}" --decode`;

        try {
            const { stdout, stderr } = await execAsync(command);
            console.log("Python stdout:", stdout);
            if (stderr) console.error("Python stderr:", stderr);

            // Extract Aegis-ID from stdout
            // Format expected: "Extracted Aegis-ID: <uuid>"
            const idMatch = stdout.match(/Extracted Aegis-ID: ([\w-]+)/);
            const aegisId = idMatch ? idMatch[1] : null;

            // Cleanup
            await fs.rm(tempDir, { recursive: true, force: true });

            if (aegisId) {
                return NextResponse.json({
                    protected: true,
                    aegisId: aegisId,
                    message: "Aegis-ID detected. This image is protected by Aegis."
                });
            } else {
                return NextResponse.json({
                    protected: false,
                    message: "No Aegis-ID found. This image is not protected by Aegis."
                });
            }

        } catch (execError: any) {
            // aegis_shield.py exits with 1 if ID not found, which throws execError
            console.log("Python Execution status (might be expected):", execError.message);

            // Cleanup on error
            await fs.rm(tempDir, { recursive: true, force: true });

            if (execError.stdout && execError.stdout.includes("No Aegis-ID found")) {
                return NextResponse.json({
                    protected: false,
                    message: "No Aegis-ID found. This image is not protected by Aegis."
                });
            }

            return NextResponse.json(
                { error: "Verification failed at engine level", details: execError.stderr || execError.message },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Failed to verify image" },
            { status: 500 }
        );
    }
}
