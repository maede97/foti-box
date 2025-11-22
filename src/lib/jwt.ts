import { environmentVariables } from "@/config/environment";
import jwt from "jsonwebtoken";

const JWT_SECRET = environmentVariables.JWT_SECRET;

export function generateToken(adminId: string) {
  return jwt.sign({ id: adminId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
