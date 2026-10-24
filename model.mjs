const MIN_RATE = 0;
const MAX_RATE = 1;

export function assertRate(value, label = 'rate') {
  if (!Number.isFinite(value) || value < MIN_RATE || value > MAX_RATE) throw new RangeError(`${label} must be between 0 and 1`);
}

export function assertPositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be positive`);
}

export function normalCdf(x) {
  if (!Number.isFinite(x)) return x === Infinity ? 1 : 0;
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * z);
  const poly = (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
  const erf = 1 - poly * Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}

export function inverseNormal(probability) {
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) throw new RangeError('probability must be between 0 and 1');
  let low = -9; let high = 9;
  for (let i = 0; i < 90; i++) {
    const mid = (low + high) / 2;
    if (normalCdf(mid) < probability) low = mid; else high = mid;
  }
  return (low + high) / 2;
}

export function criticalZ(alpha = 0.05) {
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1) throw new RangeError('alpha must be between 0 and 1');
  return inverseNormal(1 - alpha / 2);
}

export function sampleSizeTwoProportion({ baseline, mde, alpha = 0.05, power = 0.8 }) {
  assertRate(baseline, 'baseline');
  if (!Number.isFinite(mde) || mde <= 0 || baseline + mde > 1) throw new RangeError('mde must be positive and fit within the rate range');
  if (!Number.isFinite(power) || power <= 0 || power >= 1) throw new RangeError('power must be between 0 and 1');
  const p1 = baseline; const p2 = baseline + mde; const pooled = (p1 + p2) / 2;
  const za = criticalZ(alpha); const zb = inverseNormal(power);
  const numerator = za * Math.sqrt(2 * pooled * (1 - pooled)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  return Math.ceil((numerator * numerator) / (mde * mde));
}

export function analyzeTwoProportion({ controlSuccesses, controlN, treatmentSuccesses, treatmentN, alpha = 0.05 }) {
  for (const [value, label] of [[controlN, 'controlN'], [treatmentN, 'treatmentN']]) assertPositive(value, label);
  for (const [successes, n, label] of [[controlSuccesses, controlN, 'controlSuccesses'], [treatmentSuccesses, treatmentN, 'treatmentSuccesses']]) {
    if (!Number.isInteger(successes) || successes < 0 || successes > n) throw new RangeError(`${label} must be a whole number between 0 and its sample size`);
  }
  const controlRate = controlSuccesses / controlN; const treatmentRate = treatmentSuccesses / treatmentN;
  const difference = treatmentRate - controlRate;
  const relativeLift = controlRate === 0 ? null : difference / controlRate;
  const standardError = Math.sqrt((controlRate * (1 - controlRate)) / controlN + (treatmentRate * (1 - treatmentRate)) / treatmentN);
  const z = criticalZ(alpha); const ciLow = difference - z * standardError; const ciHigh = difference + z * standardError;
  const pooled = (controlSuccesses + treatmentSuccesses) / (controlN + treatmentN);
  const nullError = Math.sqrt(pooled * (1 - pooled) * (1 / controlN + 1 / treatmentN));
  const statistic = nullError === 0 ? 0 : difference / nullError;
  const pValue = 2 * (1 - normalCdf(Math.abs(statistic)));
  let conclusion = 'inconclusive';
  if (pValue < alpha && ciLow > 0) conclusion = 'positive';
  if (pValue < alpha && ciHigh < 0) conclusion = 'negative';
  return { controlRate, treatmentRate, difference, relativeLift, standardError, ciLow, ciHigh, statistic, pValue, conclusion };
}

export function assessGuardrail({ controlRate, treatmentRate, declineThreshold = 0 }) {
  assertRate(controlRate, 'guardrail controlRate'); assertRate(treatmentRate, 'guardrail treatmentRate');
  if (!Number.isFinite(declineThreshold) || declineThreshold < 0) throw new RangeError('declineThreshold must be nonnegative');
  const difference = treatmentRate - controlRate;
  const review = difference < -declineThreshold;
  return { difference, review, note: review ? 'Guardrail decline exceeds the configured threshold; investigate before shipping.' : 'No configured guardrail breach in this toy analysis.' };
}
