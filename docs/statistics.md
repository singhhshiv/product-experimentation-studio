# Statistical notes

The tool estimates the sample size for a two-sided, equal-allocation comparison of two independent proportions. The MDE is an absolute percentage-point difference, not a relative percentage lift.

The outcome analysis reports an unpooled confidence interval for the treatment-minus-control difference and a pooled two-proportion z-test under the null hypothesis of equal rates. The p-value is two-sided. A confidence interval crossing zero is shown as inconclusive even if the observed lift is positive.

This approximation is not automatically appropriate for repeated users, clustered teams, time-series experiments, sequential monitoring, multiple variants, ratio metrics, or low counts. Use an analysis plan suited to the design. Statistical significance does not establish causality if randomization, exposure, or instrumentation is compromised.
