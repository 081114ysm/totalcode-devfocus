import test from "node:test";
import assert from "node:assert/strict";
import { getMetrics, observeRequest } from "../services/metrics.js";

test("request metrics aggregate count and duration", () => {
  observeRequest("GET", "/health", 200, 12);
  observeRequest("GET", "/health", 200, 20);
  const metric = getMetrics().requests.find((item) => item.key === "GET /health 200");
  assert.deepEqual(metric, { key: "GET /health 200", count: 2, total: 32, max: 20 });
});
