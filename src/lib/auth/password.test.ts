import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "./password";

test("a hash verifies its own password and nothing else", async () => {
  const stored = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", stored), true);
  assert.equal(await verifyPassword("correct horse battery stapler", stored), false);
  assert.equal(await verifyPassword("", stored), false);
});

test("hashes are salted and record their scrypt parameters", async () => {
  const [a, b] = await Promise.all([hashPassword("same password"), hashPassword("same password")]);
  assert.notEqual(a, b);
  assert.match(a, /^scrypt\$16384\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
});

test("passwords are compared after NFKC normalization", async () => {
  // "ﬁ" (U+FB01 ligature) normalizes to "fi" -- the same password typed on a different keyboard.
  const stored = await hashPassword("ﬁle-secret");
  assert.equal(await verifyPassword("file-secret", stored), true);
});

test("a malformed or foreign stored hash never verifies", async () => {
  for (const stored of ["", "plaintext", "bcrypt$10$abc$def", "scrypt$16384$8$1$$", "scrypt$nan$8$1$c2FsdA==$aGFzaA=="]) {
    assert.equal(await verifyPassword("anything", stored), false, stored);
  }
});

test("the dummy check always fails", async () => {
  assert.equal(await verifyAgainstDummy("waie-timing-equalizer"), false);
});
