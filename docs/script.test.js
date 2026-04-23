const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeText,
  filterQuestions,
  createPracticeState,
  movePracticeIndex,
  getQuestionStats,
  getCapabilityHint,
  getHeroStatItems,
  getHeroDescriptions
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

test("questions dataset includes multiple categories and usable answer points", () => {
  assert.ok(questions.length >= 150);
  assert.ok(new Set(questions.map((item) => item.category)).size >= 12);
  assert.ok(questions.every((item) => item.answerPoints.length >= 3));
});

test("modern C++ section includes richer C++11/14/17 coverage", () => {
  const modernQuestions = questions.filter((item) => item.category === "现代 C++");
  const modernIds = new Set(modernQuestions.map((item) => item.id));

  assert.ok(modernQuestions.length >= 34);
  assert.ok(modernIds.has("modern-decltype"));
  assert.ok(modernIds.has("modern-override-final"));
  assert.ok(modernIds.has("modern-structured-bindings"));
  assert.ok(modernIds.has("modern-if-constexpr"));
  assert.ok(modernIds.has("modern-shared-ptr-internals"));
  assert.ok(modernIds.has("modern-condition-variable"));
  assert.ok(modernIds.has("modern-atomic-memory-order"));
  assert.ok(modernIds.has("modern-sfinae-vs-if-constexpr"));
  assert.ok(modernIds.has("modern-fold-expressions"));
  assert.ok(modernIds.has("modern-weak-ptr"));
  assert.ok(modernIds.has("modern-enable-shared-from-this"));
  assert.ok(modernIds.has("modern-async-launch-policy"));
  assert.ok(modernIds.has("modern-thread-lifecycle"));
  assert.ok(modernIds.has("modern-thread-pool-design"));
  assert.ok(modernIds.has("modern-template-instantiation"));
  assert.ok(modernIds.has("modern-variadic-template-pitfalls"));
  assert.ok(modernIds.has("modern-compare-exchange"));
});

test("modern C++ capability hint highlights C++11/14/17 and engineering topics", () => {
  const hint = getCapabilityHint("现代 C++");

  assert.match(hint, /C\+\+11\/14\/17/);
  assert.match(hint, /并发/);
  assert.match(hint, /模板/);
});

test("linux networking and concurrency sections include high-frequency follow-up questions", () => {
  const ids = new Set(questions.map((item) => item.id));
  const followupCategories = questions.filter((item) =>
    ["IPC 与网络", "同步与并发", "调试与排障", "性能优化"].includes(item.category)
  );

  assert.ok(followupCategories.length >= 46);
  assert.ok(ids.has("net-epoll-reactor-proactor"));
  assert.ok(ids.has("net-backlog-half-open"));
  assert.ok(ids.has("net-reuseaddr-reuseport"));
  assert.ok(ids.has("net-nonblocking-eagain"));
  assert.ok(ids.has("net-backpressure"));
  assert.ok(ids.has("sync-spurious-wakeup"));
  assert.ok(ids.has("sync-lock-granularity"));
  assert.ok(ids.has("sync-shared-memory-ring-buffer"));
  assert.ok(ids.has("debug-ss-lsof-strace"));
  assert.ok(ids.has("debug-futex-perf"));
  assert.ok(ids.has("perf-fd-limit-c10k"));
  assert.ok(ids.has("perf-epoll-busy-loop"));
});

test("hero stats include compact mobile labels", () => {
  const items = getHeroStatItems(
    {
      total: 168,
      categories: 14,
      highFrequency: 82
    },
    37
  );

  assert.deepEqual(
    items.map((item) => item.shortLabel),
    ["总数", "专题", "高频", "结果"]
  );
  assert.deepEqual(
    items.map((item) => item.label),
    ["题目总数", "专题数量", "高频题", "当前结果"]
  );
});

test("hero descriptions provide a shorter mobile reading version", () => {
  const descriptions = getHeroDescriptions();

  assert.match(descriptions.full, /GitHub Pages/);
  assert.match(descriptions.compact, /刷题/);
  assert.ok(descriptions.compact.length < descriptions.full.length);
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
