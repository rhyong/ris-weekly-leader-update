import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

const password = "password123";
const hash = hashPassword(password);

console.log(`Password: ${password}`);
console.log(`SHA-256 Hash: ${hash}`);