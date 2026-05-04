import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { mkdir } from "fs/promises";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    if (session.roleName !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { format = "sql" } = await request.json();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "backups");
    await mkdir(backupDir, { recursive: true });

    const dbUrl = process.env.DATABASE_URL || "";
    const urlParts = new URL(dbUrl);
    const host = urlParts.hostname;
    const port = urlParts.port || "3306";
    const user = urlParts.username;
    const password = urlParts.password;
    const database = urlParts.pathname.slice(1);

    const sqlFile = path.join(backupDir, `backup-${timestamp}.sql`);
    const dumpCmd = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${sqlFile}`;

    try {
      await execAsync(dumpCmd);

      let finalFile = sqlFile;
      if (format === "zip") {
        finalFile = `${sqlFile}.zip`;
        await execAsync(`zip -j ${finalFile} ${sqlFile}`);
      } else if (format === "gz") {
        finalFile = `${sqlFile}.gz`;
        await execAsync(`gzip -k ${sqlFile}`);
      }

      return NextResponse.json({
        success: true,
        filename: path.basename(finalFile),
        path: finalFile,
      });
    } catch (error) {
      console.error("Backup error:", error);
      return NextResponse.json({ error: "Backup failed" }, { status: 500 });
    }
  });
}
