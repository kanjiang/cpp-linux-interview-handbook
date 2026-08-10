const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeText,
  filterQuestions,
  createPracticeState,
  movePracticeIndex,
  getQuestionStats,
  isCompanyCategory,
  matchesCompanyTrack,
  getCompanyTrackOptions,
  readCompanyTrackFromLocation,
  readCategoryFromLocation,
  codeSectionTitle
} = require("./script.js");
const { questions } = require("./questions.js");

const sampleQuestions = [
  {
    id: "cpp-pointer-reference",
    category: "C++ basics",
    question: "What is the difference between a pointer and a reference?",
    difficulty: "basic",
    highFrequency: true,
    keywords: ["pointer", "reference"],
    answerPoints: ["Pointers can be null and re-assigned."]
  }
];

test("normalizeText lowercases and trims text", () => {
  assert.equal(normalizeText("  Linux C++  "), "linux c++");
});

test("filterQuestions matches keyword search and high-frequency filter", () => {
  const results = filterQuestions(sampleQuestions, {
    search: "pointer",
    category: "all",
    difficulty: "all",
    highFrequencyOnly: true
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "cpp-pointer-reference");
});

test("filterQuestions narrows results by category and difficulty", () => {
  const results = filterQuestions(
    [
      {
        id: "linux-thread",
        category: "Process and thread model",
        question: "What is the difference between a process and a thread?",
        difficulty: "basic",
        highFrequency: true,
        keywords: ["process", "thread"],
        answerPoints: ["Processes isolate address spaces."]
      },
      {
        id: "epoll-lt-et",
        category: "Network programming",
        question: "What is the difference between LT and ET in epoll?",
        difficulty: "advanced",
        highFrequency: true,
        keywords: ["epoll", "lt", "et"],
        answerPoints: ["ET requires draining until EAGAIN."]
      }
    ],
    {
      search: "",
      category: "Network programming",
      difficulty: "advanced",
      highFrequencyOnly: false
    }
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "epoll-lt-et");
});

test("filterQuestions supports company special quick filters", () => {
  const results = filterQuestions(
    [
      {
        id: "glw-code",
        category: "广立微 / 编程题",
        question: "反转链表",
        difficulty: "basic",
        highFrequency: true,
        keywords: ["链表"],
        answerPoints: ["三指针法。"]
      },
      {
        id: "eda-company",
        category: "芯片 / EDA 公司专项",
        question: "EDA 工具链价值",
        difficulty: "basic",
        highFrequency: true,
        keywords: ["EDA"],
        answerPoints: ["流程自动化。"]
      },
      {
        id: "general-cpp",
        category: "C++ 基础",
        question: "什么是引用",
        difficulty: "basic",
        highFrequency: true,
        keywords: ["引用"],
        answerPoints: ["对象别名。"]
      }
    ],
    {
      search: "",
      category: "all",
      difficulty: "all",
      companyTrack: "guangliwei",
      highFrequencyOnly: false
    }
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "glw-code");
});

test("isCompanyCategory recognizes Hundsun categories", () => {
  assert.equal(isCompanyCategory("恒生 / C++与内存"), true);
  assert.equal(isCompanyCategory("C++ 基础"), false);
});

test("matchesCompanyTrack filters Hundsun track", () => {
  assert.equal(matchesCompanyTrack("恒生 / Linux与调试", "hundsun"), true);
  assert.equal(matchesCompanyTrack("广立微 / C++ 岗", "hundsun"), false);
  assert.equal(matchesCompanyTrack("恒生 / 系统设计", "company-special"), true);
});

test("getCompanyTrackOptions includes hundsun", () => {
  const values = getCompanyTrackOptions().map((item) => item.value);
  assert.ok(values.includes("hundsun"));
});

test("readCompanyTrackFromLocation reads company query", () => {
  assert.equal(
    readCompanyTrackFromLocation({ search: "?company=hundsun" }),
    "hundsun"
  );
  assert.equal(readCompanyTrackFromLocation({ search: "" }), "all");
});

test("readCategoryFromLocation reads known category query", () => {
  assert.equal(
    readCategoryFromLocation(
      { search: "?category=%E6%81%92%E7%94%9F%20%2F%20C%2B%2B%E4%B8%8E%E5%86%85%E5%AD%98" },
      questions
    ),
    "恒生 / C++与内存"
  );
  assert.equal(
    readCategoryFromLocation({ search: "?category=不存在的分类" }, questions),
    "all"
  );
  assert.equal(readCategoryFromLocation({ search: "" }, questions), "all");
});

test("questions dataset includes Hundsun company categories", () => {
  const categories = new Set(questions.map((item) => item.category));
  [
    "恒生 / 知识直讲",
    "恒生 / 岗位与业务",
    "恒生 / C++与内存",
    "恒生 / Linux与调试",
    "恒生 / 并发与进程",
    "恒生 / 数据库基础",
    "恒生 / 系统设计"
  ].forEach((name) => assert.ok(categories.has(name)));

  const hundsun = questions.filter((item) => item.category.indexOf("恒生 /") === 0);
  assert.ok(hundsun.length >= 30);
  assert.ok(hundsun.every((item) => item.id.indexOf("hs-") === 0));
  assert.ok(hundsun.every((item) => item.answerPoints.length >= 3));
});

test("Hundsun knowledge entries include study materials", () => {
  const knowledge = questions.filter((item) => item.category === "恒生 / 知识直讲");
  assert.ok(knowledge.length >= 8);
  assert.ok(knowledge.every((item) => (item.diagramSteps || []).length >= 3));
  assert.ok(knowledge.every((item) => (item.pitfalls || []).length >= 2));
  assert.ok(knowledge.some((item) => Boolean(item.cppCode)));
});

test("questions dataset includes multiple categories and usable answer points", () => {
  assert.ok(questions.length >= 150);
  assert.ok(new Set(questions.map((item) => item.category)).size >= 12);
  assert.ok(questions.every((item) => item.answerPoints.length >= 3));
});

test("questions dataset includes cpp knowledge entry for this pointer", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-this-pointer");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 3);
  assert.match(entry.cppCode, /this->value/);
  assert.ok(entry.pitfalls.length >= 4);
  assert.match(entry.pitfalls.join(" "), /悬空 this/);
});

test("questions dataset includes lambda knowledge entry with pitfalls", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-lambda");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 3);
  assert.ok(entry.pitfalls.length >= 3);
  assert.match(entry.question, /lambda/);
});

test("questions dataset includes move forward, virtual inheritance and std function knowledge entries", () => {
  const ids = [
    "cpp-knowledge-move-forward",
    "cpp-knowledge-virtual-inheritance",
    "cpp-knowledge-std-function"
  ];

  ids.forEach((id) => {
    const entry = questions.find((item) => item.id === id);

    assert.ok(entry);
    assert.equal(entry.category, "C++ 知识直讲");
    assert.ok(entry.answerPoints.length >= 4);
    assert.ok(entry.pitfalls.length >= 2);
  });
});

test("questions dataset includes array allocation knowledge entry", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-array-allocation");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 5);
  assert.ok(entry.pitfalls.length >= 4);
  assert.match(entry.cppCode, /std::array/);
  assert.match(entry.answerPoints.join(" "), /栈/);
});

test("questions dataset includes rodata and consteval knowledge entries", () => {
  const rodata = questions.find((item) => item.id === "cpp-knowledge-rodata");
  const constevalEntry = questions.find((item) => item.id === "cpp-knowledge-consteval");

  assert.ok(rodata);
  assert.equal(rodata.category, "C++ 知识直讲");
  assert.ok(rodata.diagramSteps.length >= 4);
  assert.match(rodata.answerPoints.join(" "), /\.rodata/);

  assert.ok(constevalEntry);
  assert.equal(constevalEntry.category, "C++ 知识直讲");
  assert.ok(constevalEntry.pitfalls.length >= 3);
  assert.match(constevalEntry.cppCode, /consteval/);
  assert.match(constevalEntry.answerPoints.join(" "), /constinit/);
});

test("questions dataset includes constexpr vs define knowledge entry", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-constexpr-vs-define");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 4);
  assert.ok(entry.pitfalls.length >= 3);
  assert.match(entry.cppCode, /#define/);
  assert.match(entry.answerPoints.join(" "), /预处理/);
});

test("questions dataset includes backend high-frequency C++ knowledge pack", () => {
  const ids = [
    "cpp-knowledge-explicit",
    "cpp-knowledge-delete-copy",
    "cpp-knowledge-mutex",
    "cpp-knowledge-smart-ptr-backend",
    "cpp-knowledge-lock-wrappers",
    "cpp-knowledge-socket-guard",
    "cpp-knowledge-string-vector-memory",
    "cpp-knowledge-emplace-vs-push",
    "cpp-knowledge-process-memory-layout"
  ];

  ids.forEach((id) => {
    const entry = questions.find((item) => item.id === id);
    assert.ok(entry, id);
    assert.equal(entry.category, "C++ 知识直讲");
    assert.ok(entry.answerPoints.length >= 4);
    assert.ok((entry.diagramSteps || []).length >= 3);
    assert.ok((entry.pitfalls || []).length >= 2);
  });
});

test("questions dataset includes RAII knowledge entry", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-raii");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 3);
  assert.ok(entry.pitfalls.length >= 3);
  assert.match(entry.cppCode, /lock_guard/);
  assert.match(entry.answerPoints.join(" "), /栈展开|生命周期/);
});

test("questions dataset includes noexcept knowledge entry", () => {
  const entry = questions.find((item) => item.id === "cpp-knowledge-noexcept");

  assert.ok(entry);
  assert.equal(entry.category, "C++ 知识直讲");
  assert.ok(entry.diagramSteps.length >= 4);
  assert.ok(entry.pitfalls.length >= 3);
  assert.match(entry.cppCode, /is_nothrow_move_constructible/);
  assert.match(entry.answerPoints.join(" "), /vector|扩容/);
});

test("questions dataset includes debugging toolbox drill category", () => {
  const drills = questions.filter((item) => item.category === "调试工具直讲");

  assert.ok(drills.length >= 12);
  assert.ok(drills.every((item) => item.id.indexOf("debug-tool-") === 0));
  assert.ok(drills.every((item) => item.answerPoints.length >= 4));
  assert.ok(drills.every((item) => (item.diagramSteps || []).length >= 3));
  assert.ok(drills.every((item) => (item.pitfalls || []).length >= 2));
  assert.ok(drills.filter((item) => Boolean(item.cppCode)).length >= 8);
});

test("debugging drills cover gdb, sanitizers, valgrind, perf and strace", () => {
  const ids = [
    "debug-tool-pick",
    "debug-tool-gdb-breakpoint",
    "debug-tool-gdb-watch",
    "debug-tool-gdb-deadlock",
    "debug-tool-asan",
    "debug-tool-tsan",
    "debug-tool-valgrind",
    "debug-tool-perf-stat",
    "debug-tool-flamegraph",
    "debug-tool-strace",
    "debug-tool-build-flags"
  ];

  ids.forEach((id) => {
    const entry = questions.find((item) => item.id === id);
    assert.ok(entry, id);
    assert.equal(entry.category, "调试工具直讲");
  });

  const watch = questions.find((item) => item.id === "debug-tool-gdb-watch");
  assert.match(watch.cppCode, /watch/);
  assert.match(watch.answerPoints.join(" "), /Old value|观察点/);
});

test("code blocks are labelled by the language the category actually uses", () => {
  assert.equal(codeSectionTitle("数据库直讲"), "SQL 示例");
  assert.equal(codeSectionTitle("调试工具直讲"), "命令示例");
  assert.equal(codeSectionTitle("C++ 知识直讲"), "C++ 参考代码");
});

test("questions dataset includes database drill category", () => {
  const drills = questions.filter((item) => item.category === "数据库直讲");

  assert.ok(drills.length >= 12);
  assert.ok(drills.every((item) => item.id.indexOf("db-") === 0));
  assert.ok(drills.every((item) => item.answerPoints.length >= 4));
  assert.ok(drills.every((item) => (item.diagramSteps || []).length >= 3));
  assert.ok(drills.every((item) => (item.pitfalls || []).length >= 3));
  assert.ok(drills.filter((item) => Boolean(item.cppCode)).length >= 10);
});

test("database drills cover transactions, isolation, locking and indexing", () => {
  const ids = [
    "db-acid",
    "db-isolation-levels",
    "db-phantom-read",
    "db-mvcc",
    "db-snapshot-vs-current-read",
    "db-row-lock-index",
    "db-deadlock",
    "db-btree",
    "db-clustered-index",
    "db-composite-index",
    "db-index-invalid",
    "db-explain",
    "db-redo-binlog",
    "db-index-tradeoff"
  ];

  ids.forEach((id) => {
    const entry = questions.find((item) => item.id === id);
    assert.ok(entry, id);
    assert.equal(entry.category, "数据库直讲");
  });

  const acid = questions.find((item) => item.id === "db-acid");
  assert.match(acid.cppCode, /START TRANSACTION/);
  assert.match(acid.answerPoints.join(" "), /undo|redo/);

  const btree = questions.find((item) => item.id === "db-btree");
  assert.match(btree.answerPoints.join(" "), /磁盘|IO/);
});

test("C++ basics questions carry the same depth as the walkthrough categories", () => {
  const basics = questions.filter((item) => item.category === "C++ 基础");

  assert.ok(basics.length >= 11);
  assert.ok(basics.every((item) => item.answerPoints.length >= 5));
  assert.ok(basics.every((item) => (item.diagramSteps || []).length >= 5));
  assert.ok(basics.every((item) => (item.pitfalls || []).length >= 4));
  assert.ok(basics.every((item) => Boolean(item.cppCode)));
  assert.ok(basics.every((item) => (item.complexity || []).length >= 2));
});

test("OOP and memory questions match the C++ basics depth", () => {
  ["面向对象", "内存管理"].forEach((category) => {
    const group = questions.filter((item) => item.category === category);

    assert.ok(group.length >= 11, category + " lost questions");
    group.forEach((item) => {
      assert.ok(item.answerPoints.length >= 5, item.id + " answerPoints");
      assert.ok((item.diagramSteps || []).length >= 5, item.id + " diagramSteps");
      assert.ok((item.pitfalls || []).length >= 4, item.id + " pitfalls");
      assert.ok(Boolean(item.cppCode), item.id + " cppCode");
      assert.ok((item.complexity || []).length >= 2, item.id + " complexity");
    });
  });
});

test("answer prose carries no raw HTML tags, since it is escaped on render", () => {
  const fields = ["answerPoints", "diagramSteps", "pitfalls", "complexity"];

  questions.forEach((item) => {
    fields.forEach((field) => {
      (item[field] || []).forEach((line) => {
        // 只匹配闭合标签和 <br>，避免误伤 make_shared<B>() 这类模板实参。
        assert.doesNotMatch(
          line,
          /<\/(b|i|strong|em|code|span|p)>|<br\s*\/?>/,
          item.id + "." + field + " would render the tag literally: " + line
        );
      });
    });
  });
});

// 展开的卡片会占满整行，所以 71 列不是硬性的布局上限，而是一条排版预算：
// 手机宽度下无论如何都要横向滚动，这条线只是防止示例代码继续变宽。
test("code samples stay inside the question card width", () => {
  const wide = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\uff00-\uff60]/;
  const columns = (line) =>
    [...line].reduce((sum, ch) => sum + (wide.test(ch) ? 2 : 1), 0);

  ["面向对象", "内存管理", "C++ 基础", "STL"].forEach((category) => {
    questions
      .filter((item) => item.category === category && item.cppCode)
      .forEach((item) => {
        item.cppCode.split("\n").forEach((line, index) => {
          assert.ok(
            columns(line) <= 71,
            item.id + " line " + (index + 1) + " is " + columns(line) + " columns: " + line
          );
        });
      });
  });
});

test("the sort question answers the hand-written question and the comparator contract", () => {
  const entry = questions.find((item) => item.id === "stl-sort");
  const prose = entry.answerPoints
    .concat(entry.diagramSteps, entry.pitfalls, entry.complexity)
    .join(" ");

  assert.equal(entry.category, "STL");
  assert.ok(entry.answerPoints.length >= 5);
  assert.ok(entry.diagramSteps.length >= 5);
  assert.ok(entry.pitfalls.length >= 4);
  // 三段算法必须都点到名，否则 introsort 讲不完整。
  assert.match(prose, /introsort/i);
  assert.match(prose, /快速排序|快排/);
  assert.match(prose, /堆排序/);
  assert.match(prose, /插入排序/);
  // 契约是这题真正的考点：严格弱序、不稳定、以及别整体排序。
  assert.match(prose, /严格.{0,2}弱序/);
  assert.match(prose, /未定义行为/);
  assert.match(prose, /不稳定/);
  assert.match(prose, /stable_sort/);
  assert.match(prose, /nth_element/);
  // 冒泡的结论要明确给出，这是提问的原点。
  assert.match(prose, /冒泡/);
  assert.match(entry.cppCode, /std::tie/);
});

test("the RAII question explains stack unwinding and the lock_guard naming trap", () => {
  const entry = questions.find((item) => item.id === "memory-raii");
  const prose = entry.answerPoints.concat(entry.diagramSteps, entry.pitfalls).join(" ");

  assert.equal(entry.category, "内存管理");
  assert.match(prose, /栈展开/);
  assert.match(prose, /noexcept/);
  // 少写变量名会让 lock_guard 变成立即析构的临时对象。
  assert.match(prose, /临时对象/);
  assert.match(entry.cppCode, /lock_guard/);
});

test("the new-versus-malloc question splits new into allocation and construction", () => {
  const entry = questions.find((item) => item.id === "memory-new-vs-malloc");
  const prose = entry.answerPoints.concat(entry.diagramSteps).join(" ");

  assert.match(prose, /operator new/);
  assert.match(prose, /placement new/);
  assert.match(prose, /bad_alloc/);
  assert.match(entry.cppCode, /new \(buf\)/);
});

test("the shared_ptr thread-safety question separates all three layers", () => {
  const entry = questions.find((item) => item.id === "memory-shared-threadsafe");
  const prose = entry.answerPoints.concat(entry.diagramSteps, entry.pitfalls).join(" ");

  // 控制块安全、对象不安全、shared_ptr 变量本身也不安全。
  assert.match(prose, /控制块/);
  assert.match(prose, /数据竞争/);
  assert.match(entry.cppCode, /atomic<std::shared_ptr/);
});

test("the inline question separates the keyword from the compiler optimisation", () => {
  const entry = questions.find((item) => item.id === "cpp-inline");
  const prose = entry.answerPoints.concat(entry.diagramSteps, entry.pitfalls).join(" ");

  assert.equal(entry.category, "C++ 基础");
  assert.ok(entry.highFrequency);
  // 旧文案用「性能内联」这种含糊说法，没有点破关键字和优化是两件事。
  assert.doesNotMatch(prose, /性能内联/);
  assert.match(prose, /内联优化/);
  assert.match(prose, /ODR|重复定义|multiple definition/);
  assert.match(prose, /LTO/);
  assert.match(entry.cppCode, /always_inline/);
});

test("Hundsun track covers new memory and system programming topics", () => {
  const ids = [
    "hs-cpp-alignment",
    "hs-cpp-memory-pool",
    "hs-cpp-stl-choice",
    "hs-linux-core-missing",
    "hs-linux-deadlock-live",
    "hs-linux-epoll-lt-et",
    "hs-linux-signal-safe",
    "hs-linux-oom",
    "hs-linux-sanitizer-choice"
  ];

  ids.forEach((id) => {
    const entry = questions.find((item) => item.id === id);
    assert.ok(entry, id);
    assert.equal(entry.category.indexOf("恒生 /"), 0);
    assert.ok(entry.answerPoints.length >= 4);
  });
});

test("question ids stay unique across the whole dataset", () => {
  const ids = questions.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("createPracticeState builds a filtered practice pool", () => {
  const state = createPracticeState(questions, {
    search: "",
    category: "IPC 与网络",
    difficulty: "all",
    highFrequencyOnly: true
  });

  assert.ok(state.pool.length > 0);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.pool.every((item) => item.category === "IPC 与网络"), true);
  assert.equal(state.pool.every((item) => item.highFrequency), true);
});

test("movePracticeIndex stays inside pool boundaries", () => {
  assert.equal(movePracticeIndex(0, 5, -1), 0);
  assert.equal(movePracticeIndex(1, 5, -1), 0);
  assert.equal(movePracticeIndex(3, 5, 1), 4);
  assert.equal(movePracticeIndex(4, 5, 1), 4);
});

test("getQuestionStats summarizes total categories and high-frequency count", () => {
  const stats = getQuestionStats(questions);

  assert.ok(stats.total >= 150);
  assert.ok(stats.categories >= 12);
  assert.ok(stats.highFrequency > 0);
});
