import test from "node:test";
import assert from "node:assert/strict";
import { validateRegister } from "../middleware/validate.js";

function run(body) {
  let statusCode = 200;
  let payload;
  let nextCalled = false;
  const res = { status(code) { statusCode = code; return this; }, json(value) { payload = value; return this; } };
  validateRegister({ body }, res, () => { nextCalled = true; });
  return { statusCode, payload, nextCalled };
}

test("registration rejects weak passwords", () => {
  const result = run({ email: "user@example.com", password: "1234", nickname: "학생" });
  assert.equal(result.statusCode, 400);
  assert.match(result.payload.error, /8자/);
});

test("registration accepts a valid student payload", () => {
  const result = run({ email: "user@example.com", password: "study1234", nickname: "학생" });
  assert.equal(result.nextCalled, true);
});
