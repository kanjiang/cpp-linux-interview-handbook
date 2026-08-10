const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const docsDir = __dirname;
const htmlFiles = fs
  .readdirSync(docsDir)
  .filter((name) => name.endsWith(".html"))
  .sort();

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

function readPage(name) {
  return fs.readFileSync(path.join(docsDir, name), "utf8");
}

function extractSvgBlocks(source) {
  const blocks = [];
  const openPattern = /<svg\b/g;
  let match;
  while ((match = openPattern.exec(source))) {
    const end = source.indexOf("</svg>", match.index);
    assert.notEqual(end, -1, "found <svg> without a matching </svg>");
    blocks.push(source.slice(match.index, end + "</svg>".length));
  }
  return blocks;
}

/**
 * SVG 是 XML 语法，标签必须严格闭合。HTML 解析器会静默吞掉错误，
 * 所以这里用栈自己校验一遍，防止手写图表时漏掉闭合标签。
 */
function findSvgStructureError(fragment) {
  const stack = [];
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
  let match;
  while ((match = pattern.exec(fragment))) {
    const [, closing, tag, attrs, selfClosing] = match;
    if (closing) {
      const open = stack.pop();
      if (open !== tag) {
        return "</" + tag + "> closes <" + open + ">, so <" + open + "> was never closed";
      }
    } else if (!selfClosing && !VOID_TAGS.has(tag.toLowerCase())) {
      stack.push(tag);
    }
    void attrs;
  }
  return stack.length > 0 ? "<" + stack[stack.length - 1] + "> was never closed" : null;
}

test("every page is a complete HTML document", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    assert.match(source, /^<!DOCTYPE html>/i, name);
    assert.match(source, /<html lang="zh-CN">/, name);
    assert.ok(source.includes("</html>"), name);
  });
});

test("inline SVG diagrams are well formed", () => {
  let diagrams = 0;
  htmlFiles.forEach((name) => {
    extractSvgBlocks(readPage(name)).forEach((block) => {
      diagrams += 1;
      const problem = findSvgStructureError(block);
      assert.equal(problem, null, name + ": " + problem);
    });
  });

  assert.ok(diagrams > 0, "expected the notes pages to ship inline SVG diagrams");
});

test("SVG url(#id) references resolve inside the same document", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    const ids = new Set();
    const idPattern = /\sid="([^"]+)"/g;
    let match;
    while ((match = idPattern.exec(source))) {
      ids.add(match[1]);
    }

    const refPattern = /url\(#([^)]+)\)/g;
    while ((match = refPattern.exec(source))) {
      assert.ok(ids.has(match[1]), name + " references a missing element id: " + match[1]);
    }
  });
});

test("pages using diagrams also ship the arrow marker sprite", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    if (!source.includes("guide-figure")) {
      return;
    }
    assert.ok(source.includes('class="d-defs"'), name + " is missing the shared marker sprite");
  });
});

test("every diagram has an accessible label and a caption", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    const figurePattern = /<figure class="guide-figure">([\s\S]*?)<\/figure>/g;
    let match;
    while ((match = figurePattern.exec(source))) {
      const figure = match[1];
      assert.match(figure, /role="img"/, name + " has a diagram without role=\"img\"");
      assert.match(figure, /aria-label="[^"]{8,}"/, name + " has a diagram without a usable aria-label");
      assert.match(figure, /<figcaption>[\s\S]*?<\/figcaption>/, name + " has a diagram without a caption");
    }
  });
});

test("diagram styles referenced by pages exist in the stylesheet", () => {
  const css = fs.readFileSync(path.join(docsDir, "style.css"), "utf8");
  [
    ".guide-figure",
    ".d-defs",
    ".d-panel",
    ".d-box",
    ".d-t",
    ".d-line"
  ].forEach((selector) => {
    assert.ok(css.includes(selector), "style.css is missing " + selector);
  });
});

test("internal page links and category deep links resolve", () => {
  const { questions } = require("./questions.js");
  const categories = new Set(questions.map((item) => item.category));

  htmlFiles.forEach((name) => {
    const source = readPage(name);

    const hrefPattern = /href="\.\/([^"#?]+)/g;
    let match;
    while ((match = hrefPattern.exec(source))) {
      assert.ok(
        fs.existsSync(path.join(docsDir, match[1])),
        name + " links to a missing file: " + match[1]
      );
    }

    const categoryPattern = /category=([^"&]+)/g;
    while ((match = categoryPattern.exec(source))) {
      const category = decodeURIComponent(match[1].replace(/&amp;/g, "&"));
      assert.ok(
        categories.has(category),
        name + " deep links to an unknown category: " + category
      );
    }
  });
});

test("table-of-contents anchors point at sections that exist", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    const ids = new Set();

    const idPattern = /\sid="([^"]+)"/g;
    let match;
    while ((match = idPattern.exec(source))) {
      ids.add(match[1]);
    }

    const anchorPattern = /href="#([^"]+)"/g;
    while ((match = anchorPattern.exec(source))) {
      assert.ok(ids.has(match[1]), name + " links to a missing anchor: #" + match[1]);
    }
  });
});
