/**
 * Creates (or promotes) an admin account for /admin.
 *
 *   npm run admin:create -- admin@example.com "Display Name"
 *
 * The password is read from ADMIN_PASSWORD if set (handy for CI), otherwise
 * prompted for with the input hidden. Re-running for an existing email resets
 * that user's password and (re)grants the ADMIN role.
 *
 * Needs DATABASE_URL (from the environment, .env.local or .env) and a schema
 * that has the User.role / User.passwordHash / User.sessionVersion columns
 * (`npm run db:migrate`).
 */
import { createInterface } from "node:readline";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { ADMIN_PASSWORD_MIN_LENGTH } from "../src/lib/auth/password-policy";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent -- fine, the variable may already be in the environment
  }
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const muted = rl as unknown as { _writeToOutput: (text: string) => void };
    const original = muted._writeToOutput.bind(rl);
    muted._writeToOutput = (text) => {
      if (text.includes(question)) original(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const [emailArg, ...nameParts] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage: npm run admin:create -- <email> ["Display Name"]');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set -- admin accounts live in the database.");
    process.exit(1);
  }

  const password = process.env.ADMIN_PASSWORD ?? (await promptHidden("Password: "));
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    console.error(`Password must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`);
    process.exit(1);
  }
  if (!process.env.ADMIN_PASSWORD && (await promptHidden("Repeat password: ")) !== password) {
    console.error("Passwords don't match.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const name = nameParts.join(" ").trim() || undefined;
    const passwordHash = await hashPassword(password);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    await prisma.user.upsert({
      where: { email },
      create: { email, name, passwordHash, role: "ADMIN" },
      // A new password signs the account out of every existing session (see User.sessionVersion).
      update: { passwordHash, role: "ADMIN", sessionVersion: { increment: 1 }, ...(name ? { name } : {}) },
    });
    console.log(`${existing ? "Updated" : "Created"} admin ${email}. Sign in at /login.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
