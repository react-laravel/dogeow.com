import assert from "node:assert/strict";
import test from "node:test";

import { getGreeting } from "../src/utils.js";

const expectedGreetingByHour = [
  "夜深了",
  "夜深了",
  "夜深了",
  "夜深了",
  "夜深了",
  "早上好",
  "早上好",
  "早上好",
  "早上好",
  "上午好",
  "上午好",
  "中午好",
  "中午好",
  "下午好",
  "下午好",
  "下午好",
  "下午好",
  "傍晚好",
  "晚上好",
  "晚上好",
  "晚上好",
  "晚上好",
  "晚上好",
  "夜深了",
];

test("getGreeting covers every hour of the day", () => {
  expectedGreetingByHour.forEach((expectedGreeting, hour) => {
    const date = new Date(2026, 0, 1, hour, 0, 0);
    assert.equal(getGreeting(date), expectedGreeting, `hour ${hour}`);
  });
});

test("getGreeting rejects invalid input", () => {
  assert.throws(() => getGreeting("2026-01-01"), TypeError);
  assert.throws(() => getGreeting(new Date(Number.NaN)), TypeError);
});
