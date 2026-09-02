import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/leads — публичный сбор заявок с сайта (чат, счёт, калькулятор, формы)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body.name;
    const phone: string | undefined = body.phone;
    const source: string | undefined = body.source;
    const message: string | undefined = body.message;
    const email: string | undefined = body.email;

    if (!name || !name.trim() || !phone || !phone.trim()) {
      return NextResponse.json(
        { error: "Параметры name и phone обязательны" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim().slice(0, 200),
        phone: phone.trim().slice(0, 50),
        email: email?.trim().slice(0, 200) || null,
        source: ["chat", "invoice", "calculator", "form"].includes(source ?? "")
          ? (source as string)
          : "form",
        message: message?.trim().slice(0, 4000) || null,
      },
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить заявку", detail: String(error) },
      { status: 500 }
    );
  }
}
