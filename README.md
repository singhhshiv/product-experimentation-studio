# Product Experimentation Studio

An interactive A/B testing tool for product managers. It estimates sample size, calculates two-proportion effect sizes and confidence intervals, and explains when an experiment is positive, negative, or inconclusive.

The tool uses standard normal approximations for a two-sided two-proportion comparison. It is an educational decision aid, not a replacement for an experiment statistician or a pre-registered analysis plan.

## Run locally

Open [index.html](index.html) in a browser. No dependencies, API keys, or build step are required.

Run the calculation tests with:

```sh
node --test model.test.mjs
```

## What it includes

- Approximate equal-allocation sample-size estimation from baseline rate, absolute MDE, alpha, and power.
- Two-proportion z-test with an unpooled 95% confidence interval for the absolute difference.
- Relative lift and two-sided p-value.
- Guardrail metric review with an explicit decline threshold.
- Plain-language handling of inconclusive results and statistical limitations.

## Assumptions and limitations

The sample-size estimate assumes independent observations, a binary metric, equal allocation, a fixed horizon, and a normal approximation. It does not handle sequential peeking, interference, repeated observations, cluster randomization, ratio metrics, multiple treatment arms, or multiple testing corrections. Those designs need a more appropriate analysis plan.
