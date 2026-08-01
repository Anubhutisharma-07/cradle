const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULTS,
  buildQrOptions,
  isValidHex,
  isValidLogoType,
  shouldGenerateQRCode,
} = require("../projects/productivity/advanced-qr-code-generator/script");

test("buildQrOptions maps state into qr-code-styling options", () => {
  const options = buildQrOptions({
    text: "https://example.com",
    fgColor: "#123ABC",
    bgColor: "#F8FAFC",
    size: 420,
    margin: 16,
    errorLevel: "H",
    logo: "data:image/png;base64,abc123",
  });

  assert.equal(options.width, 420);
  assert.equal(options.height, 420);
  assert.equal(options.data, "https://example.com");
  assert.equal(options.margin, 16);
  assert.equal(options.qrOptions.errorCorrectionLevel, "H");
  assert.equal(options.dotsOptions.color, "#123ABC");
  assert.equal(options.cornersSquareOptions.color, "#123ABC");
  assert.equal(options.cornersDotOptions.color, "#123ABC");
  assert.equal(options.backgroundOptions.color, "#F8FAFC");
  assert.equal(options.image, "data:image/png;base64,abc123");
  assert.equal(options.imageOptions.crossOrigin, "anonymous");
});

test("buildQrOptions omits image when no logo is selected", () => {
  const options = buildQrOptions({
    ...DEFAULTS,
    text: "Plain text QR",
  });

  assert.equal(options.image, undefined);
});

test("isValidHex accepts 3 and 6 digit hex colors", () => {
  assert.equal(isValidHex("#fff"), true);
  assert.equal(isValidHex("#FFFFFF"), true);
  assert.equal(isValidHex("#2b2d42"), true);
});

test("isValidHex rejects malformed color input", () => {
  assert.equal(isValidHex("fff"), false);
  assert.equal(isValidHex("#12"), false);
  assert.equal(isValidHex("#12345G"), false);
  assert.equal(isValidHex("#12345678"), false);
});

test("shouldGenerateQRCode only allows non-empty text", () => {
  assert.equal(shouldGenerateQRCode("https://example.com"), true);
  assert.equal(shouldGenerateQRCode("  QR content  "), true);
  assert.equal(shouldGenerateQRCode(""), false);
  assert.equal(shouldGenerateQRCode("   "), false);
  assert.equal(shouldGenerateQRCode(null), false);
});

test("isValidLogoType allows only supported image types", () => {
  assert.equal(isValidLogoType("image/png"), true);
  assert.equal(isValidLogoType("image/jpeg"), true);
  assert.equal(isValidLogoType("image/svg+xml"), true);
  assert.equal(isValidLogoType("image/gif"), false);
  assert.equal(isValidLogoType("application/pdf"), false);
});
