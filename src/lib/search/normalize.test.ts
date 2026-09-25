import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchText, toAsciiDigits } from "./normalize";

test("toAsciiDigits converts Arabic-Indic and Extended Arabic-Indic digits", () => {
  assert.equal(toAsciiDigits("١١١"), "111");
  assert.equal(toAsciiDigits("۱۲۳"), "123");
  assert.equal(toAsciiDigits("وعي ١١١"), "وعي 111");
  assert.equal(toAsciiDigits("111"), "111");
});

test("normalizeSearchText folds hamza forms to alef", () => {
  assert.equal(normalizeSearchText("أحمد"), normalizeSearchText("احمد"));
  assert.equal(normalizeSearchText("إبراهيم"), normalizeSearchText("ابراهيم"));
  assert.equal(normalizeSearchText("آدم"), normalizeSearchText("ادم"));
});

test("normalizeSearchText folds alef maksura and taa marbuta", () => {
  assert.equal(normalizeSearchText("موسى"), normalizeSearchText("موسي"));
  assert.equal(normalizeSearchText("الجنة"), normalizeSearchText("الجنه"));
});

test("normalizeSearchText strips diacritics and tatweel", () => {
  assert.equal(normalizeSearchText("السَّلَامُ"), normalizeSearchText("السلام"));
  assert.equal(normalizeSearchText("بِسْمِ اللَّهِ"), normalizeSearchText("بسم الله"));
  assert.equal(normalizeSearchText("جميـــل"), normalizeSearchText("جميل"));
});

test("normalizeSearchText converts digit scripts as part of the full pass", () => {
  assert.equal(normalizeSearchText("حلقة ١١١"), normalizeSearchText("حلقة 111"));
});

test("normalizeSearchText collapses punctuation and whitespace without fusing words", () => {
  assert.equal(normalizeSearchText("الصبر، والتوبة"), "الصبر والتوبه");
  assert.equal(normalizeSearchText("الصبر   والتوبة"), "الصبر والتوبه");
  assert.equal(normalizeSearchText("  مرحبا  "), "مرحبا");
  // A punctuation mark with no surrounding whitespace ("صبر،والتوبة") must still
  // become a word boundary, not disappear and glue the two words into one token.
  assert.equal(normalizeSearchText("الصبر،والتوبة"), "الصبر والتوبه");
  assert.notEqual(normalizeSearchText("الصبر،والتوبة"), "الصبروالتوبه");
});

test("normalizeSearchText lowercases Latin text and is a no-op on Arabic text with no special variants", () => {
  assert.equal(normalizeSearchText("Episode 111"), "episode 111");
  assert.equal(normalizeSearchText("مرحبا"), "مرحبا");
});

test("normalizeSearchText produces an empty string for pure punctuation", () => {
  assert.equal(normalizeSearchText("؟؟؟"), "");
});
