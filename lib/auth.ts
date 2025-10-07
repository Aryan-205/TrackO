import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./hash";

const prisma = new PrismaClient();

export async function registerUser(name:string, email: string, password: string) {
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed }
  });
  return { id: user.id, email: user.email };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
