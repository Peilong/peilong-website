import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import Logic from '../../../assets/games/logic-lights/core.js';
import Cipher from '../../../assets/games/cipher/core.js';

test('logic: daily circuits are solvable, deterministic and need 2+ switches', () => {
  for (let d = 0; d < 60; d++) {
    const key = Logic.shiftDay('2026-11-25', d), c = Logic.dailyCircuit(key);
    assert.deepEqual(c, Logic.dailyCircuit(key));
    const r = Logic.search(c), best = r.lit.find(n => Logic.bitCount(n) === r.min);
    assert.ok(Logic.isSolution(c, Logic.toBits(best, c.inputs)));
    assert.ok(c.min >= 2);
  }
});
test('cipher: swaps are complete, never keep a letter, and invert', () => {
  let s = 1; const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 50; k++) {
    const key = Cipher.derangement(rand), vals = Object.values(key);
    assert.equal(new Set(vals).size, 26);
    for (const L of Cipher.ALPHABET) assert.notEqual(key[L], L);
    const plain = 'IT IS A CAPITAL MISTAKE, TO THEORISE!';
    const enc = Cipher.apply(plain, key);
    assert.equal(Cipher.apply(enc, Cipher.invert(key)), plain);
    assert.equal(Cipher.wrongLetters(enc, plain, Cipher.invert(key)), 0);
    assert.ok(Cipher.wrongLetters(enc, plain, {}) > 0);
  }
});
const quotes = new URL('../private/cipher-quotes.json', import.meta.url);
test('cipher quotations (private): letters only from A-Z, sensible length, a source each', { skip: !existsSync(quotes) }, () => {
  for (const q of JSON.parse(readFileSync(quotes))) {
    const letters = q.text.toUpperCase().replace(/[^A-Z]/g, '');
    assert.ok(letters.length >= 25 && letters.length <= 130, q.text);
    assert.equal(q.text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''), letters, 'non-English letter in ' + q.text);
    assert.ok(q.source.length > 5);
  }
});
