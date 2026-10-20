const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const context = { window: {}, document: { addEventListener() {} } };
vm.runInNewContext(readFileSync(join(__dirname, '../dist/textbook-bias-playgrounds.js'), 'utf8'), context);
const { normalizeBatch, renderParagraph } = context.window.lessonBiasPlaygrounds;
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('four-sample example uses population variance and epsilon', () => {
  const s = normalizeBatch([1, 3, 5, 7]);
  close(s.mean, 4);
  close(s.variance, 5);
  close(s.denominator, Math.sqrt(5.00001));
  s.normalized.forEach((x, i) => close(x, [-3, -1, 1, 3][i] / Math.sqrt(5.00001)));
  close(s.normalized.reduce((a, b) => a + b, 0), 0);
});

test('constant input shift cancels before the affine transformation', () => {
  const base = normalizeBatch([1, 3, 5, 7], 2, 1);
  const shifted = normalizeBatch([11, 13, 15, 17], 2, 1);
  base.output.forEach((x, i) => close(x, shifted.output[i]));
  close(shifted.mean, 14);
});

test('zero variance stays finite and produces beta', () => {
  const s = normalizeBatch([5, 5, 5, 5], -2, 1.5);
  close(s.variance, 0);
  s.output.forEach(x => close(x, 1.5));
});

test('negative gamma reverses centered responses and invalid values are rejected', () => {
  const s = normalizeBatch([1, 3, 5, 7], -2, 1);
  assert.ok(s.output[0] > s.output[3]);
  assert.throws(() => normalizeBatch([1]), /at least two/);
  assert.throws(() => normalizeBatch([NaN, 2]), /finite/);
});

test('beginner interaction and mode table stay in the existing section', () => {
  assert.equal((renderParagraph('network', 3, 7).match(/data-bn-sample aria-label/g) || []).length, 4);
  assert.match(renderParagraph('network', 3, 12), /track_running_stats=True/);
  assert.match(renderParagraph('network', 3, 15), /data-bn-bias/);
  assert.equal(renderParagraph('tensor', 3, 7), '');
});
