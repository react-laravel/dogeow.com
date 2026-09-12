import assert from "node:assert/strict";
import test from "node:test";

import {
  getBackgroundRequestSize,
  getGreeting,
  pickBackground,
} from "../src/utils.js";

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

test("wallpaper requests respect viewport, pixel density and size limits", () => {
  assert.equal(getBackgroundRequestSize(390, 844, 3), 1760);
  assert.equal(getBackgroundRequestSize(1440, 900, 1), 1440);
  assert.equal(getBackgroundRequestSize(1441, 900, 1), 1600);
  assert.equal(getBackgroundRequestSize(320, 480, 1), 960);
  assert.equal(getBackgroundRequestSize(3840, 2160, 2), 2560);
});

test("wallpaper selection avoids the current image and handles small collections", () => {
  const names = ["a.jpg", "b.jpg", "c.jpg"];
  assert.equal(
    pickBackground(names, "a.jpg", () => 0),
    "b.jpg",
  );
  assert.equal(
    pickBackground(names, "b.jpg", () => 0.999),
    "c.jpg",
  );
  assert.equal(pickBackground(["a.jpg"], "a.jpg"), "a.jpg");
  assert.equal(pickBackground([], ""), "");
});
