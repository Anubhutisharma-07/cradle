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
