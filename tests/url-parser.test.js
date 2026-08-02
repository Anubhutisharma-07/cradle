import { test } from "node:test";
import assert from "node:assert/strict";
import URLEngine from "../projects/dev-tools/url-parser/urlEngine.js";

test("parseURLComponents extracts scheme, host, path, and query params accurately", () => {
  const { components, error } = URLEngine.parseURLComponents(
    "https://cradle.dev:8080/projects/math?q=matrix&sort=asc#overview"
  );

  assert.equal(error, null);
  assert.equal(components.protocol, "https");
  assert.equal(components.hostname, "cradle.dev");
  assert.equal(components.port, "8080");
  assert.equal(components.pathname, "/projects/math");
  assert.equal(components.hash, "#overview");
  assert.equal(components.queryParams.length, 2);
  assert.equal(components.queryParams[0].key, "q");
  assert.equal(components.queryParams[0].value, "matrix");
});

test("parseURLComponents automatically prepends scheme if missing", () => {
  const { components, error } = URLEngine.parseURLComponents("github.com/cradle");
  assert.equal(error, null);
  assert.equal(components.protocol, "https");
  assert.equal(components.hostname, "github.com");
});

test("buildQueryString formats array of key-value pairs into valid query string", () => {
  const params = [
    { key: "page", value: "1" },
    { key: "limit", value: "20" },
  ];
  assert.equal(URLEngine.buildQueryString(params), "?page=1&limit=20");
});

test("encodeURLComponentSafe and decodeURLComponentSafe round-trip reserved symbols", () => {
  const original = "hello world & key=value";
  const encoded = URLEngine.encodeURLComponentSafe(original);
  const decoded = URLEngine.decodeURLComponentSafe(encoded);
  assert.equal(decoded, original);
});

test("detectFileType classifies extensions", () => {
  assert.equal(URLEngine.detectFileType("png").trim(), "Image");
  assert.equal(URLEngine.detectFileType("mp4").trim(), "Video");
  assert.equal(URLEngine.detectFileType("pdf").trim(), "Document");
  assert.equal(URLEngine.detectFileType("xyz"), "Unknown");
});

test("detectURLType classifies representative URLs", () => {
  assert.equal(
    URLEngine.detectURLType(new URL("https://example.com/photo.png"), "png"),
    "Image URL"
  );
  assert.equal(
    URLEngine.detectURLType(new URL("https://api.example.com/v1/users"), "None"),
    "API Endpoint"
  );
  assert.equal(
    URLEngine.detectURLType(new URL("https://github.com/vedant7007/cradle"), "None"),
    "GitHub URL"
  );
  assert.equal(
    URLEngine.detectURLType(new URL("https://youtu.be/dQw4w9WgXcQ"), "None"),
    "YouTube URL"
  );
  assert.equal(
    URLEngine.detectURLType(new URL("ftp://files.example.com/a.txt"), "txt"),
    "FTP URL"
  );
  assert.equal(
    URLEngine.detectURLType(new URL("https://example.com/about"), "None"),
    "Website URL"
  );
});

test("escapeHTML neutralises markup", () => {
  assert.equal(
    URLEngine.escapeHTML("<img src=x onerror=alert(1)>"),
    "&lt;img src=x onerror=alert(1)&gt;"
  );
  assert.equal(URLEngine.escapeHTML(`"&'`), "&quot;&amp;&#039;");
});

test("escapeHTML is the shared escaper for both the key and value of a row", () => {
  // createRow() interpolates escapeHTML(label) and escapeHTML(value) into
  // innerHTML, so markup in either the key or the value is rendered inert.
  const key = "<script>alert(1)</script>";
  const value = "<b onmouseover=steal()>hi</b>";
  assert.ok(!URLEngine.escapeHTML(key).includes("<"));
  assert.ok(!URLEngine.escapeHTML(value).includes("<"));
});
