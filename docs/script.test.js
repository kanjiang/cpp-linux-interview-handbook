const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeText,
  filterQuestions,
  createPracticeState,
  movePracticeIndex,
  getQuestionStats
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
