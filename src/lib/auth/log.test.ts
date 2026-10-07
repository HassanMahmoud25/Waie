import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { logAuthError } from "./log";

function captureConsoleError(run: () => void): string {
  const original = console.error;
  const lines: string[] = [];
  console.error = (...args: unknown[]) => lines.push(args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" "));
  try {
    run();
  } finally {
    console.error = original;
  }
  return lines.join("\n");
}

test("a missing column (P2022) is logged with its code, column and the migrate hint", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Invalid `prisma.user.create()` invocation:\n\nThe column `sessionVersion` does not exist in the current database.",
    { code: "P2022", clientVersion: "test", meta: { modelName: "User", column: "sessionVersion" } },
  );
  const output = captureConsoleError(() => logAuthError("serverSignupAction", error));
  assert.match(output, /serverSignupAction failed: Prisma P2022/);
  assert.match(output, /sessionVersion/);
  assert.match(output, /prisma migrate deploy/);
});

test("a validation error's message (which echoes query arguments) is never logged", () => {
  const error = new Prisma.PrismaClientValidationError(
    'Invalid `prisma.user.create()` invocation: { data: { passwordHash: "scrypt$16384$8$1$SECRETSALT$SECRETHASH" } }',
    { clientVersion: "test" },
  );
  const output = captureConsoleError(() => logAuthError("serverSignupAction", error));
  assert.match(output, /PrismaClientValidationError/);
  assert.doesNotMatch(output, /SECRET|scrypt|passwordHash/);
});

test("a unique-constraint violation keeps its code and target, nothing else", () => {
  const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`email`)", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: ["email"] },
  });
  const output = captureConsoleError(() => logAuthError("serverSignupAction", error));
  assert.match(output, /P2002/);
  assert.doesNotMatch(output, /migrate deploy/);
});
