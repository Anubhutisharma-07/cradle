const test = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeHTML,
  calculatePPA,
  getStoredProjects,
  getComparisonList,
  saveActiveProject,
  deleteProject,
  clearComparison,
  setSelectedArch,
  getSelectedArch,
  setActiveDesignData,
  getActiveDesignData,
} = require("../projects/aiml/ai-circuit-builder/script.js");
const { setupLocalStorageMock } = require("./helpers/localstorage-mock");

setupLocalStorageMock();

test("escapeHTML correctly sanitizes special HTML characters", () => {
  assert.equal(
    escapeHTML('<script>alert("XSS & Test")</script>'),
    "&lt;script&gt;alert(&quot;XSS &amp; Test&quot;)&lt;/script&gt;"
  );
  assert.equal(escapeHTML("John's Chip"), "John&#039;s Chip");
  assert.equal(escapeHTML("Normal Text"), "Normal Text");
});

test("calculatePPA calculates operating voltage (Vdd) based on process node", () => {
  const ppa10 = calculatePPA("performance", "10", 4, 2.0);
  assert.equal(ppa10.vdd, 0.95);

  const ppa7 = calculatePPA("performance", "7", 4, 2.0);
  assert.equal(ppa7.vdd, 0.85);

  const ppa5 = calculatePPA("performance", "5", 4, 2.0);
  assert.equal(ppa5.vdd, 0.75);

  const ppa3 = calculatePPA("performance", "3", 4, 2.0);
  assert.equal(ppa3.vdd, 0.68);
});

test("calculatePPA applies goal-specific adjustments for power and performance", () => {
  const perfPPA = calculatePPA("performance", "5", 8, 2.5);
  const powerPPA = calculatePPA("power", "5", 8, 2.5);

  // Power goal applies activity factor 0.12 vs 0.4 and 50% static power gating
  assert.ok(parseFloat(powerPPA.power) < parseFloat(perfPPA.power));
  assert.ok(parseFloat(powerPPA.staticPower) < parseFloat(perfPPA.staticPower));
  // Power goal scales TOPS by 0.85
  assert.equal(
    parseFloat(powerPPA.tops),
    Number((parseFloat(perfPPA.tops) * 0.85).toFixed(1))
  );
});

test("calculatePPA calculates die area and TOPS according to architecture", () => {
  setSelectedArch("npu");
  const npuPPA = calculatePPA("ai", "5", 16, 3.0);

  setSelectedArch("gpu");
  const gpuPPA = calculatePPA("ai", "5", 16, 3.0);

  setSelectedArch("asic");
  const asicPPA = calculatePPA("ai", "5", 16, 3.0);

  // GPU has higher areaFactor (1.85) than NPU (1.15) and ASIC (0.65)
  assert.ok(parseFloat(gpuPPA.area) > parseFloat(npuPPA.area));
  assert.ok(parseFloat(npuPPA.area) > parseFloat(asicPPA.area));

  // TOPS/GHz/Core: NPU (2.5) > GPU (1.2)
  assert.ok(parseFloat(npuPPA.tops) > parseFloat(gpuPPA.tops));

  // Reset architecture to default
  setSelectedArch("npu");
});

test("calculatePPA computes efficiency as TOPS / power", () => {
  setSelectedArch("npu");
  const ppa = calculatePPA("ai", "5", 8, 2.5);
  const tops = parseFloat(ppa.tops);
  const power = parseFloat(ppa.power);
  const efficiency = parseFloat(ppa.efficiency);
  assert.ok(Math.abs(efficiency - tops / power) < 0.5);
});

test("Vault and comparison storage operations interact with localStorage correctly", () => {
  localStorage.clear();

  assert.deepEqual(getStoredProjects(), []);
  assert.deepEqual(getComparisonList(), []);

  const sampleDesign = {
    id: "proj_12345",
    name: "Alpha_Chip",
    title: "High-Performance Compute Accelerator",
    description: "Sample desc",
    goal: "performance",
    node: "5",
    cores: 8,
    frequency: 2.5,
    architecture: "NPU",
    metrics: calculatePPA("performance", "5", 8, 2.5),
  };

  setActiveDesignData(sampleDesign);
  saveActiveProject();

  const projects = getStoredProjects();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].name, "Alpha_Chip");

  const comparison = getComparisonList();
  assert.equal(comparison.length, 1);
  assert.equal(comparison[0].name, "Alpha_Chip");

  // Avoid duplicating names in storage
  saveActiveProject();
  assert.equal(getStoredProjects().length, 1);

  deleteProject("proj_12345");
  assert.equal(getStoredProjects().length, 0);

  clearComparison();
  assert.equal(getComparisonList().length, 0);

  setActiveDesignData(null);
});

test("Architecture and active design getters and setters function properly", () => {
  setSelectedArch("gpu");
  assert.equal(getSelectedArch(), "gpu");

  const testDesign = { id: "test_1", name: "Test_Design" };
  setActiveDesignData(testDesign);
  assert.deepEqual(getActiveDesignData(), testDesign);

  setSelectedArch("npu");
  setActiveDesignData(null);
});
