import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, readSessionToken, verifySessionToken } from "./session";

process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";

function encode(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

test("a new token carries the session version it was issued with", async () => {
  const token = await createSessionToken("user-1", 60, 3);
  const claims = await readSessionToken(token);
  assert.equal(claims?.userId, "user-1");
  assert.equal(claims?.version, 3);
  assert.equal(await verifySessionToken(token), "user-1");
});

test("version defaults to 0 so tokens line up with the column's default", async () => {
  const claims = await readSessionToken(await createSessionToken("user-1", 60));
  assert.equal(claims?.version, 0);
});

test("a tampered version invalidates the signature", async () => {
  const token = await createSessionToken("user-1", 60, 0);
  const [body, signature] = token.split(".");
  const payload = JSON.parse(Buffer.from(body!, "base64url").toString());
  const forged = `${encode({ ...payload, ver: 1 })}.${signature}`;
  assert.equal(await readSessionToken(forged), null);
});

test("an expired token is rejected", async () => {
  assert.equal(await readSessionToken(await createSessionToken("user-1", -1, 0)), null);
});

test("a token signed with a different secret is rejected", async () => {
  const token = await createSessionToken("user-1", 60, 0);
  process.env.AUTH_SECRET = "a-completely-different-secret-of-32-plus-chars";
  try {
    assert.equal(await readSessionToken(token), null);
  } finally {
    process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  }
});
