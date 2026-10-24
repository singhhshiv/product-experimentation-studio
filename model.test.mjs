import test from 'node:test';
import assert from 'node:assert/strict';
import { normalCdf, inverseNormal, sampleSizeTwoProportion, analyzeTwoProportion, assessGuardrail } from './model.mjs';

test('normal distribution helpers are approximately inverse', () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-7);
  for (const p of [0.025, 0.5, 0.975]) assert.ok(Math.abs(normalCdf(inverseNormal(p)) - p) < 1e-6);
});

test('sample size is positive and responds to power and MDE', () => {
  const standard = sampleSizeTwoProportion({ baseline: 0.1, mde: 0.02, alpha: 0.05, power: 0.8 });
  assert.ok(standard > 1000);
  assert.ok(sampleSizeTwoProportion({ baseline: 0.1, mde: 0.01, alpha: 0.05, power: 0.8 }) > standard);
  assert.ok(sampleSizeTwoProportion({ baseline: 0.1, mde: 0.02, alpha: 0.05, power: 0.9 }) > standard);
});

test('clear positive result returns lift, interval, and significance', () => {
  const result = analyzeTwoProportion({ controlSuccesses: 50, controlN: 1000, treatmentSuccesses: 90, treatmentN: 1000 });
  assert.equal(result.conclusion, 'positive');
  assert.ok(result.difference > 0);
  assert.ok(result.ciLow > 0);
  assert.ok(result.pValue < 0.05);
});

test('small difference is treated as inconclusive', () => {
  const result = analyzeTwoProportion({ controlSuccesses: 100, controlN: 1000, treatmentSuccesses: 102, treatmentN: 1000 });
  assert.equal(result.conclusion, 'inconclusive');
  assert.ok(result.ciLow <= 0 && result.ciHigh >= 0);
});

test('guardrail flags a decline beyond the threshold', () => {
  assert.equal(assessGuardrail({ controlRate: 0.8, treatmentRate: 0.77, declineThreshold: 0.02 }).review, true);
  assert.equal(assessGuardrail({ controlRate: 0.8, treatmentRate: 0.79, declineThreshold: 0.02 }).review, false);
});

test('invalid inputs are rejected', () => {
  assert.throws(() => sampleSizeTwoProportion({ baseline: 0.9, mde: 0.2 }));
  assert.throws(() => analyzeTwoProportion({ controlSuccesses: 3, controlN: 2, treatmentSuccesses: 2, treatmentN: 10 }));
  assert.throws(() => assessGuardrail({ controlRate: 1.1, treatmentRate: 0.5 }));
});
