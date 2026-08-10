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

test("an expanded card takes the whole row so code has room", () => {
  const css = fs.readFileSync(path.join(docsDir, "style.css"), "utf8");

  // 网格项是外层的 .question-card，把 grid-column 写到里面的 details 上无效。
  assert.match(
    css,
    /\.question-grid\s+\.question-card:has\(details\[open\]\)\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    "expanded cards should span every column"
  );
});

test("an expanded card does not stretch its row neighbour", () => {
  const css = fs.readFileSync(path.join(docsDir, "style.css"), "utf8");
  const { renderQuestionCard } = require("./script.js");

  // 网格默认 align-items: stretch，同行的折叠卡会被展开卡撑到同样高度。
  const rule = css.match(/\.question-grid:has\(details\[open\]\)\s*\{[^}]*\}/);
  assert.ok(rule, "style.css is missing the rule that relaxes the grid when a card is open");
  assert.match(rule[0], /align-items:\s*start/);

  // 上面的选择器只有在卡片确实把 details 套在 .question-card 里时才成立。
  const markup = renderQuestionCard(
    { question: "q", keywords: [], difficulty: "basic", highFrequency: false, answerPoints: ["a"] },
    true
  );
  assert.match(markup, /class="question-card"[\s\S]*<details open>/);
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

test("subsection numbers inside a section run in order", () => {
  htmlFiles.forEach((name) => {
    const source = readPage(name);
    const headingPattern = /<h([23])>\s*(?:(\d+)\.(\d+)[.、 ])?/g;
    let match;
    let major = null;
    let expected = null;

    while ((match = headingPattern.exec(source))) {
      const [, level, headMajor, headMinor] = match;
      if (level === "2") {
        major = null;
        expected = null;
        continue;
      }
      if (headMinor === undefined) continue;

      const label = headMajor + "." + headMinor;
      if (major === null) {
        major = headMajor;
        expected = 1;
      }
      assert.equal(
        headMajor,
        major,
        name + " switches to major number " + headMajor + " at " + label + " without a new h2"
      );
      assert.equal(
        Number(headMinor),
        expected,
        name + " jumps to " + label + ", expected " + major + "." + expected
      );
      expected += 1;
    }
  });
});

test("the memory notes explain the SRAM / DRAM / DDR hierarchy", () => {
  const source = readPage("cpp-memory-perf-notes.html");

  ["SRAM", "DRAM", "DDR5", "L1", "L2", "L3", "cache line"].forEach((term) => {
    assert.ok(source.includes(term), "memory notes never mention " + term);
  });

  assert.ok(
    /内存控制器（IMC）是集成在 CPU 片内/.test(source),
    "memory notes should place the memory controller on the CPU die, not the motherboard"
  );
  assert.ok(
    !/主板上的内存控制器发起请求/.test(source),
    "memory notes still describe the pre-Nehalem northbridge memory controller"
  );
});

test("the container notes cover the std::sort contract, not just the algorithm", () => {
  const source = readPage("cpp-containers-notes.html");

  ["introsort", "严格", "弱序", "未定义行为", "stable_sort", "nth_element", "partial_sort"].forEach(
    (term) => {
      assert.ok(source.includes(term), "container notes never mention " + term);
    }
  );

  // 越界那一段是这节的核心：比较器自反会让分区循环走出数组。
  assert.ok(/越界/.test(source), "container notes should explain the out-of-bounds read");
  // 别只讲 sort，选型表要给出更省的替代品。
  assert.ok(
    /std::list/.test(source) && /list::sort/.test(source),
    "container notes should note that std::sort needs random-access iterators"
  );
});
