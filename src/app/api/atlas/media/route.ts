import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "atlas");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 413 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Неподдерживаемый тип файла" }, { status: 415 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${crypto.randomUUID()}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/atlas/${name}` });
}
