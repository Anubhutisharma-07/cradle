import { test } from "node:test";
import assert from "node:assert/strict";
import QREngine from "../projects/productivity/advanced-qr-code-generator/qrEngine.js";

test("isValidHex validates hex colors correctly", () => {
  assert.equal(QREngine.isValidHex("#FFF"), true);
  assert.equal(QREngine.isValidHex("#2B2D42"), true);
  assert.equal(QREngine.isValidHex("2B2D42"), false);
  assert.equal(QREngine.isValidHex("#GGGGGG"), false);
});

test("sanitizeOptions returns fallback defaults for invalid parameters", () => {
  const sanitized = QREngine.sanitizeOptions({
    fgColor: "invalid",
    size: -50,
    errorLevel: "Z",
  });

  assert.equal(sanitized.fgColor, "#2B2D42");
  assert.equal(sanitized.size, 100);
  assert.equal(sanitized.errorLevel, "M");
});

test("buildConfigPayload formats valid QRCodeStyling config payload", () => {
  const payload = QREngine.buildConfigPayload({
    text: "https://cradle.dev",
    fgColor: "#000000",
    bgColor: "#FFFFFF",
    size: 400,
    errorLevel: "H",
  });

  assert.equal(payload.data, "https://cradle.dev");
  assert.equal(payload.width, 400);
  assert.equal(payload.dotsOptions.color, "#000000");
  assert.equal(payload.backgroundOptions.color, "#FFFFFF");
  assert.equal(payload.qrOptions.errorCorrectionLevel, "H");
});
