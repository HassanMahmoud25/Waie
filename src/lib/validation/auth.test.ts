import { test } from "node:test";
import assert from "node:assert/strict";
import { changePasswordSchema, requestPasswordResetSchema, resetPasswordSchema } from "./auth";
import { ADMIN_PASSWORD_MIN_LENGTH, minPasswordLengthFor } from "../auth/password-policy";

test("admins get the stricter floor create-admin has always enforced", () => {
  assert.equal(minPasswordLengthFor("ADMIN"), ADMIN_PASSWORD_MIN_LENGTH);
  assert.equal(minPasswordLengthFor("USER"), 8);
});

test("changePasswordSchema: an admin can't drop below 12 characters", () => {
  const schema = changePasswordSchema(minPasswordLengthFor("ADMIN"));
  assert.equal(schema.safeParse({ currentPassword: "x", newPassword: "elevenchars" }).success, false);
  assert.equal(schema.safeParse({ currentPassword: "x", newPassword: "twelve-chars" }).success, true);
});

test("changePasswordSchema: the current password is required", () => {
  const result = changePasswordSchema().safeParse({ currentPassword: "", newPassword: "long-enough" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0]?.path[0], "currentPassword");
});

test("changePasswordSchema: non-string input is rejected", () => {
  assert.equal(changePasswordSchema().safeParse({ currentPassword: 1, newPassword: ["a"] }).success, false);
});

test("resetPasswordSchema: requires a token and enforces the base floor and cap", () => {
  assert.equal(resetPasswordSchema.safeParse({ token: "", password: "long-enough" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "t", password: "short" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "t", password: "x".repeat(1025) }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "t", password: "long-enough" }).success, true);
});

test("requestPasswordResetSchema: normalizes the email", () => {
  const result = requestPasswordResetSchema.safeParse({ email: "  Admin@Example.COM " });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "admin@example.com");
});
