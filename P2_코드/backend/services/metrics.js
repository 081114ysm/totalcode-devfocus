const startedAt = Date.now();
const counters = new Map();
const durations = new Map();

export function observeRequest(method, route, status, durationMs) {
  const key = `${method} ${route} ${status}`;
  counters.set(key, (counters.get(key) || 0) + 1);
  const current = durations.get(key) || { count: 0, total: 0, max: 0 };
  durations.set(key, { count: current.count + 1, total: current.total + durationMs, max: Math.max(current.max, durationMs) });
}

export function getMetrics() {
  return {
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    memory: process.memoryUsage(),
    requests: [...counters.entries()].map(([key, count]) => ({ key, count, ...durations.get(key) })),
  };
}
