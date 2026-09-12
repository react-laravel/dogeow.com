import assert from "node:assert/strict";
import test from "node:test";
import { createWallpaperController } from "../src/background.js";

function setup(names = ["a.jpg", "b.jpg", "c.jpg"]) {
  const requests = [];
  const commits = [];
  const states = [];
  let size = 960;
  const controller = createWallpaperController({
    names,
    random: () => 0,
    getUrl: (name) => `${name}/${size}`,
    onCommit: (value) => commits.push(value),
    onStateChange: (value) => states.push(value),
    load: (url, { signal }) =>
      new Promise((resolve, reject) => {
        requests.push({ url, signal, resolve, reject });
      }),
  });
  return {
    controller,
    requests,
    commits,
    states,
    resize: (value) => {
      size = value;
    },
  };
}

test("only a loaded wallpaper commits, and switching never repeats the current image", async () => {
  const { controller, requests, commits, states } = setup();
  const first = controller.change();
  assert.equal(commits.length, 0);
  assert.equal(states.at(-1).loading, true);
  requests[0].resolve();
  assert.equal(await first, true);
  assert.deepEqual(commits, [{ name: "a.jpg", url: "a.jpg/960" }]);

  const second = controller.change();
  assert.equal(requests[1].url, "b.jpg/960");
  assert.equal(commits.length, 1);
  requests[1].resolve();
  await second;
  assert.equal(commits.at(-1).name, "b.jpg");
  assert.deepEqual(states.at(-1), { loading: false, error: "" });
});

test("a failed switch keeps the displayed wallpaper and remains retryable", async () => {
  const { controller, requests, commits, states } = setup();
  const first = controller.change();
  requests[0].resolve();
  await first;
  const failed = controller.change();
  requests[1].reject(new Error("offline"));
  assert.equal(await failed, false);
  assert.equal(commits.length, 1);
  assert.equal(commits.at(-1).name, "a.jpg");
  assert.equal(states.at(-1).loading, false);
  assert.match(states.at(-1).error, /保留当前背景/);

  const retry = controller.change();
  requests[2].resolve();
  assert.equal(await retry, true);
  assert.equal(commits.at(-1).name, "b.jpg");
});

test("initial failure shows a retry message and the next attempt can succeed", async () => {
  const { controller, requests, commits, states } = setup();
  const failed = controller.change();
  requests[0].reject(new Error("timeout"));
  await failed;
  assert.equal(commits.length, 0);
  assert.match(states.at(-1).error, /重试/);
  const retry = controller.change();
  requests[1].resolve();
  assert.equal(await retry, true);
});

for (const outcome of ["resolve", "reject"]) {
  test(`superseded requests cannot overwrite the latest image or loading state (${outcome})`, async () => {
    const { controller, requests, commits, states } = setup();
    const first = controller.change();
    const second = controller.change();
    assert.equal(requests[0].signal.aborted, true);
    requests[1].resolve();
    await second;
    const stateCount = states.length;
    requests[0][outcome](new Error("late response"));
    assert.equal(await first, false);
    assert.equal(commits.length, 1);
    assert.equal(commits[0].name, "b.jpg");
    assert.equal(states.length, stateCount);
  });
}

test("resize preserves the pending selection and deduplicates identical requests", async () => {
  const { controller, requests, commits, resize } = setup();
  const first = controller.change();
  requests[0].resolve();
  await first;
  assert.equal(await controller.resize(), false);
  const switchImage = controller.change();
  assert.equal(await controller.resize(), false);
  resize(1920);
  const resizeImage = controller.resize();
  assert.equal(requests[2].url, "b.jpg/1920");
  assert.equal(requests[1].signal.aborted, true);
  requests[2].resolve();
  await resizeImage;
  requests[1].resolve();
  await switchImage;
  assert.deepEqual(commits.at(-1), { name: "b.jpg", url: "b.jpg/1920" });
  assert.equal(commits.length, 2);
});

test("an empty collection makes no requests", async () => {
  const { controller, requests } = setup([]);
  assert.equal(await controller.change(), false);
  assert.equal(await controller.resize(), false);
  assert.equal(requests.length, 0);
});
