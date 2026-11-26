import { test } from 'node:test';
import assert from 'node:assert/strict';
import Slots from '../../../assets/games/exam-slots/core.js';

test('slots: daily puzzles are deterministic, need exactly k slots, and the search solves them', () => {
  for (let d = 0; d < 70; d++) {
    const key = Slots.shiftDay('2026-11-25', d), p = Slots.dailyPuzzle(key);
    assert.deepEqual(p, Slots.dailyPuzzle(key));
    assert.equal(p.k, Slots.LEVELS[Slots.levelFor(key)].k);
    assert.equal(Slots.fewestSlots(Slots.neighbors(p.n, p.edges)), p.k);
    assert.equal(new Set(p.nodes.map(c => c.name)).size, p.n);
    const r = Slots.search(p);
    assert.ok(r.solved && Slots.isSolution(p, r.slots), key);
  }
});
test('slots: answers with a clash, a missing course or a slot out of range are refused', () => {
  const p = Slots.dailyPuzzle('2026-11-29'), good = Slots.search(p).slots;
  assert.ok(Slots.isSolution(p, good));
  const e = p.edges[0], clash = good.slice(); clash[e[1]] = clash[e[0]];
  assert.ok(!Slots.isSolution(p, clash));
  assert.ok(Slots.clashes(p, clash).includes(0));
  const missing = good.slice(); missing[3] = null;
  assert.ok(!Slots.isSolution(p, missing));
  const out = good.slice(); out[0] = p.k;
  assert.ok(!Slots.isSolution(p, out));
  assert.ok(!Slots.isSolution(p, good.slice(1)));
  assert.ok(!Slots.isSolution(p, good.map(String)));
});
test('slots: no two lines cross', () => {
  const side = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  for (let d = 0; d < 30; d++) {
    const p = Slots.dailyPuzzle(Slots.shiftDay('2026-11-25', d)), P = p.nodes;
    for (const [a, b] of p.edges) for (const [c, e] of p.edges) {
      if (new Set([a, b, c, e]).size < 4) continue;
      const d1 = side(P[c], P[e], P[a]), d2 = side(P[c], P[e], P[b]), d3 = side(P[a], P[b], P[c]), d4 = side(P[a], P[b], P[e]);
      assert.ok(!(d1 * d2 < 0 && d3 * d4 < 0));
    }
  }
});
