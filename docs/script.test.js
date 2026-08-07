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
  readCategoryFromLocation
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
