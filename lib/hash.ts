import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function comparePasswords(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}
