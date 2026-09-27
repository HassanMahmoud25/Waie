/**
 * One-time CMS data setup: creates a Person record for each of Waie's three
 * existing static hosts (src/data/hosts.ts), reusing their existing photos
 * under public/hosts/. This is deliberately NOT an automatic migration --
 * it only creates the canonical Person rows an admin can then pick from the
 * episode editor's participant picker. It does NOT tag them onto any
 * episode: which episodes each of them actually appeared in is an editorial
 * decision, made per episode in /admin/episodes/[id].
 *
 * Idempotent: matches by name, so re-running does nothing once each row
 * exists (never creates a duplicate, never overwrites an image an admin has
 * since edited by hand).
 *
 *   npx tsx scripts/seed-hosts-as-people.ts
 *
 * Needs DATABASE_URL (from the environment, .env.local or .env).
 */
import { PrismaClient } from "@prisma/client";
import { hosts } from "../src/data/hosts";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent -- fine, the variable may already be in the environment
  }
}

const prisma = new PrismaClient();

async function main() {
  for (const host of hosts) {
    const existing = await prisma.person.findFirst({ where: { name: host.name } });
    if (existing) {
      console.log(`Person "${host.name}" already exists -- skipping.`);
      continue;
    }
    const person = await prisma.person.create({ data: { name: host.name, imageUrl: host.photoUrl } });
    console.log(`Created Person "${person.name}" (${person.id}) with imageUrl ${person.imageUrl}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
