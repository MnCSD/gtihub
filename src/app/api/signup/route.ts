import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";
    let name: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = (body.email as string)?.trim().toLowerCase();
      password = (body.password as string) ?? "";
      name = (body.name as string)?.trim();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      email = ((form.get("email") as string) || "").trim().toLowerCase();
      password = (form.get("password") as string) || "";
      name = ((form.get("name") as string) || "").trim();
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Signup error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

