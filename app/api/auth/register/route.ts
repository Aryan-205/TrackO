import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/hash";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) return NextResponse.json({ error: "User exists" }, { status: 409 });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { name,email, password: hashed } });
  return NextResponse.json({ email: user.email }, { status: 201 });
}
