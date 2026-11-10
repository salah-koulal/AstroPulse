import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const stageSelector = '[data-testid="model-stage"]';

test("prepared assets contain only the requested meshes, self-contained in one scene", () => {
  for (const name of ["astronaut", "anatomy"]) {
    const bytes = readFileSync(`public/models/${name}.glb`);
    const gltf = JSON.parse(
      bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
    );
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
    expect(gltf.scenes).toHaveLength(1);
    expect(bytes.length).toBeLessThan(2_000_000);
    expect(gltf.buffers.every((buffer: { uri?: string }) => !buffer.uri)).toBe(
      true,
    );
    if (name === "anatomy")
      expect(
        gltf.nodes.map((node: { name: string }) => node.name).sort(),
      ).toEqual([
        "Heart",
        "Liver",
        "Lung_left",
        "Lung_right",
        "Quadriceps_left",
        "Quadriceps_right",
        "Skeleton",
        "Stomach",
      ]);
  }
});

test("swaps preserve the canvas, camera, framing, selection and sidebar state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".glb")) requests.push(request.url());
  });
  await page.goto("/");
  const stage = page.locator(stageSelector);
  await expect(stage).toHaveAttribute("data-status", "ready");
  expect(requests.some((url) => url.endsWith("anatomy.glb"))).toBe(false);
  const canvas = await page.locator("canvas").elementHandle();
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.waitForTimeout(250);
  const camera = await stage.getAttribute("data-camera");
  const frame = await stage.boundingBox();
  await page
    .getByRole("button", { name: "Cardiovascular", exact: true })
    .click();
  await expect(stage).toHaveAttribute("data-status", "ready");
  await expect(stage).toHaveAttribute("data-model", "anatomy");
  await expect(
    page.getByRole("heading", { name: "Heart", exact: true }),
  ).toBeVisible();
  await expect(stage).toHaveAttribute("data-camera", camera!);
  expect(await stage.boundingBox()).toEqual(frame);
  for (const mode of ["Suit on", "Suit off", "Suit on", "Suit off"])
    await page.getByRole("button", { name: mode, exact: true }).click();
  await expect(stage).toHaveAttribute("data-selection", "cardiovascular");
  await expect(stage).toHaveAttribute("data-camera", camera!);
  await page.getByRole("button", { name: "AI Agent", exact: true }).click();
  expect(await stage.boundingBox()).toEqual(frame);
  await expect(stage).toHaveAttribute("data-camera", camera!);
  await page
    .getByRole("button", { name: "Summarize sample readings", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("heart rate is 68 bpm");
  await page.getByRole("button", { name: "Body", exact: true }).click();
  await page.getByRole("button", { name: "AI Agent", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("heart rate is 68 bpm");
  expect(
    await canvas!.evaluate((node) => node === document.querySelector("canvas")),
  ).toBe(true);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(stage).not.toHaveAttribute("data-camera", camera!);
  await expect(stage).toHaveAttribute("data-selection", "cardiovascular");
  expect(errors).toEqual([]);
});

test("all body controls select named anatomy and show associated readings", async ({
  page,
}) => {
  await page.goto("/");
  const stage = page.locator(stageSelector);
  for (const [button, heading, reading] of [
    ["Cardiovascular", "Heart", "Heart rate"],
    ["Respiratory", "Lungs", "Oxygen saturation"],
    ["Skeletal", "Skeleton", "Bone density baseline"],
    ["Muscular", "Thigh muscles", "Exercise today"],
    ["Digestive", "Liver & stomach", "Energy intake"],
  ]) {
    await page.getByRole("button", { name: "Suit on", exact: true }).click();
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(stage).toHaveAttribute("data-status", "ready");
    await expect(stage).toHaveAttribute("data-model", "anatomy");
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".primary-reading")).toContainText(reading);
  }
});

test("missing anatomy gives an exact error, retains other model, and retries in-place", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/models/anatomy.glb", (route) =>
    fail ? route.fulfill({ status: 404, body: "missing" }) : route.continue(),
  );
  await page.goto("/");
  const stage = page.locator(stageSelector);
  await expect(stage).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Rotate left", exact: true }).click();
  await page.waitForTimeout(100);
  const camera = await stage.getAttribute("data-camera");
  await page.getByRole("button", { name: "Suit off", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("models/anatomy.glb");
  await page.getByRole("button", { name: "Suit on", exact: true }).click();
  await expect(stage).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Suit off", exact: true }).click();
  fail = false;
  await page.getByRole("button", { name: "Retry model", exact: true }).click();
  await expect(stage).toHaveAttribute("data-status", "ready");
  await expect(stage).toHaveAttribute("data-camera", camera!);
});

test("loading, voice cancellation, keyboard and narrow reduced-motion layout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/models/astronaut.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Loading NASA astronaut" }),
  ).toBeVisible();
  await expect(page.locator(stageSelector)).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(
    page.getByRole("button", { name: "Rotate", exact: true }),
  ).toBeDisabled();
  const cardiac = page.getByRole("button", {
    name: "Cardiovascular",
    exact: true,
  });
  await cardiac.focus();
  await page.keyboard.press("Enter");
  await expect(cardiac).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(stageSelector)).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.getByRole("button", { name: "AI Agent", exact: true }).click();
  await page
    .getByRole("button", { name: "Try voice demo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cancel voice demo", exact: true })
    .click();
  await page.waitForTimeout(1900);
  await expect(page.getByRole("log")).not.toContainText("[Simulated voice]");
  await page
    .getByRole("button", { name: "Try voice demo", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("[Simulated voice]");
  await expect(
    page.getByText("Simulated voice · Microphone is not used"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Send demo message", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Enter a message");
  await expect(page.getByRole("textbox")).toBeFocused();
});
