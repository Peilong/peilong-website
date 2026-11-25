import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import Core from '../../../assets/games/code-word/core.js';

// 2 = right spot, 1 = elsewhere in the word, 0 = not in the word (or no copies left)
const m = (g, a) => Core.marks(g, a).join('');

test('marks: right spot, elsewhere, absent', () => {
  assert.equal(m('cache', 'cache'), '22222');
  assert.equal(m('reach', 'cache'), '01111');   // e, a, c, h are all in CACHE, none in the right spot
  assert.equal(m('pixel', 'cache'), '00010');
});

test('marks: a repeated letter is marked only as often as the answer has it', () => {
  assert.equal(m('level', 'hotel'), '00022');   // HOTEL has one E and one L, both matched in place
  assert.equal(m('geese', 'those'), '00022');   // the extra Es get nothing
  assert.equal(m('speed', 'abide'), '00101');   // only the first E counts as elsewhere
  assert.equal(m('array', 'stack'), '10000');   // one A in STACK, so only the first A is marked
});

test('marks: right-spot matches are counted before elsewhere ones', () => {
  assert.equal(m('loop', 'pool'), '1221');
  assert.equal(m('allot', 'lilac'), '11200');   // the L in place is matched first, then one more L elsewhere
});

test('tries, cleaning and numbering', () => {
  assert.equal(Core.triesFor(4), 5);
  assert.equal(Core.triesFor(7), 8);
  assert.equal(Core.clean(' Ca-Che!'), 'cache');
  assert.equal(Core.dayNumber(Core.EPOCH), 1);
  assert.equal(Core.dayNumber(Core.shiftDay(Core.EPOCH, 30)), 31);
});

const termsFile = new URL('../private/codeword-terms.json', import.meta.url);
test('answer list (private) fits the game; every answer is a valid guess', { skip: !existsSync(termsFile) }, () => {
  const terms = JSON.parse(readFileSync(termsFile));
  const words = new Set(readFileSync(new URL('../data/words.txt', import.meta.url), 'utf8').split('\n'));
  const seen = new Set();
  for (const t of terms) {
    assert.match(t.word, /^[a-z]{4,7}$/, t.word);
    assert.ok(words.has(t.word), t.word + ' missing from words.txt');
    assert.ok(!seen.has(t.word), t.word + ' listed twice');
    seen.add(t.word);
    assert.ok(t.about.length > 30 && t.about.length <= 260, t.word + ': explanation length');
  }
});
