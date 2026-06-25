export function computeDriftIndex({
  violationRate,
  errorRate,
  contextHealth,
}: {
  violationRate: number;
  errorRate: number;
  contextHealth: number;
}) {
  return clamp(
    0.5 * violationRate +
      0.3 * errorRate +
      0.2 * (1 - contextHealth)
  );
}

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}
