import { sampleSizeTwoProportion, analyzeTwoProportion, assessGuardrail } from './model.mjs';
const $ = id => document.getElementById(id);
const fmtPct = (x, digits = 2) => `${(x * 100).toFixed(digits)}%`;
function render() {
  const baseline = +$('baseline').value / 100; const mde = +$('mde').value / 100; const power = +$('power').value / 100;
  $('baselineOut').textContent = fmtPct(baseline, 0); $('mdeOut').textContent = `${(+$('mde').value).toFixed(0)} pp`; $('powerOut').textContent = fmtPct(power, 0);
  try { $('sampleSize').textContent = sampleSizeTwoProportion({ baseline, mde, power }).toLocaleString(); } catch { $('sampleSize').textContent = '—'; }
  try {
    const result = analyzeTwoProportion({ controlSuccesses: +$('controlSuccesses').value, controlN: +$('controlN').value, treatmentSuccesses: +$('treatmentSuccesses').value, treatmentN: +$('treatmentN').value });
    const tone = result.conclusion === 'inconclusive' ? 'warn' : '';
    $('analysis').innerHTML = `<strong class="${tone}">${result.conclusion[0].toUpperCase() + result.conclusion.slice(1)}</strong><dl><dt>Control rate</dt><dd>${fmtPct(result.controlRate)}</dd><dt>Treatment rate</dt><dd>${fmtPct(result.treatmentRate)}</dd><dt>Absolute difference</dt><dd>${fmtPct(result.difference)}</dd><dt>Relative lift</dt><dd>${result.relativeLift === null ? 'n/a' : fmtPct(result.relativeLift)}</dd><dt>95% interval</dt><dd>[${fmtPct(result.ciLow)}, ${fmtPct(result.ciHigh)}]</dd><dt>Two-sided p-value</dt><dd>${result.pValue.toFixed(4)}</dd></dl>`;
  } catch (error) { $('analysis').textContent = error.message; }
  try {
    const result = assessGuardrail({ controlRate: +$('guardControl').value / 100, treatmentRate: +$('guardTreatment').value / 100, declineThreshold: +$('guardThreshold').value / 100 });
    $('guardrail').innerHTML = `<strong class="${result.review ? 'warn' : ''}">${result.review ? 'Review before shipping' : 'No configured breach'}</strong><br>Observed change: ${fmtPct(result.difference)}. ${result.note}`;
  } catch (error) { $('guardrail').textContent = error.message; }
}
['baseline','mde','power','controlSuccesses','controlN','treatmentSuccesses','treatmentN','guardControl','guardTreatment','guardThreshold'].forEach(id => $(id).addEventListener('input', render));
render();
