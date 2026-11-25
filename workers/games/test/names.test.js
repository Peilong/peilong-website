import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkName, nameKey } from '../src/names.js';

const blocked = ['shit', 'Sh1t', 's h i t', 'S.H.I.T', 'f u c k', 'F_U_C_K', 'fuuuck', 'phuck', 'b1tch', 'a55hole', 'c-u-n-t',
  'Dick', 'p3nis', 'sexy jay', 'Hitler', 'nazi', 'admin', 'Site Admin', 'Moderator', 'nigga', 'fuk you', 'ｓｈｉｔ'];
const allowed = ['Richard', 'Dickens', 'Hancock', 'Cassidy', 'Scunthorpe', 'Sussex', 'Sexton', 'Therapist', 'grape',
  'Titus', 'Cockburn', 'Ana', 'Peilong', 'Blue Jay', 'Matsushita', "O'Brien", 'Jean-Luc', 'José', 'Zoë', '李明', 'Nazila',
  'Bass', 'Analyst', 'Kumar', 'CS122 Rocks', 'pro_gamer_7'];

test('profane or reserved names are rejected', () => {
  for (const n of blocked) assert.ok(checkName(n).error, n);
});
test('ordinary names are allowed', () => {
  for (const n of allowed) assert.ok(checkName(n).name, `${n}: ${checkName(n).error}`);
});
test('length and character rules', () => {
  assert.match(checkName('A').error, /at least 2/);
  assert.match(checkName('x'.repeat(17)).error, /at most 16/);
  assert.match(checkName('me@site.com').error, /letters, numbers/);
  assert.match(checkName('<b>hi</b>').error, /letters, numbers/);
  assert.match(checkName('a​b').error, /letters, numbers/);       // zero-width space
  assert.match(checkName('_leading').error, /letters, numbers/);
  assert.equal(checkName(42).error, 'Please enter a name.');
  assert.equal(checkName('  Ada   Lovelace ').name, 'Ada Lovelace');
});
test('name key ignores case and extra spaces', () => {
  assert.equal(nameKey('Ada  Lovelace'), nameKey('ada lovelace'));
});
