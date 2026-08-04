const test = require("node:test");
const assert = require("node:assert/strict");
const ShapeEngine = require("../projects/editor/css-shape-designer/shapeEngine");

test("ShapeEngine generates polygon clip-path correctly", () => {
  const vertices = [
    { x: 50, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const css = ShapeEngine.generateClipPathCSS("polygon", { vertices });
  assert.equal(css, "clip-path: polygon(50% 0%, 100% 100%, 0% 100%);");
});

test("ShapeEngine generates circle clip-path correctly", () => {
  const circle = { cx: 50, cy: 50, r: 40 };
  const css = ShapeEngine.generateClipPathCSS("circle", { circle });
  assert.equal(css, "clip-path: circle(40% at 50% 50%);");
});

test("ShapeEngine generates ellipse clip-path correctly", () => {
  const ellipse = { cx: 50, cy: 50, rx: 40, ry: 30 };
  const css = ShapeEngine.generateClipPathCSS("ellipse", { ellipse });
  assert.equal(css, "clip-path: ellipse(40% 30% at 50% 50%);");
});

test("ShapeEngine generates blob border-radius correctly", () => {
  const blob = {
    tlh: 30, trh: 70, brh: 70, blh: 30,
    tlv: 30, trv: 30, brv: 70, blv: 70,
  };
  const css = ShapeEngine.generateClipPathCSS("blob", { blob });
  assert.equal(css, "border-radius: 30% 30% 30% 30% / 30% 30% 30% 30%;");
});

test("ShapeEngine generates valid SVG code markup", () => {
  const vertices = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ];
  const svg = ShapeEngine.generateSVGCode("polygon", { vertices }, 200, 200);
  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes("<polygon points=\"0,0 200,0 200,200\""));
});

test("ShapeEngine generates Tailwind CSS utility string", () => {
  const circle = { cx: 50, cy: 50, r: 40 };
  const tw = ShapeEngine.generateTailwindCode("circle", { circle });
  assert.ok(tw.includes("class=\"[clip-path:circle(40%_at_50%_50%)]\""));
});
