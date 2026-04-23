function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function filterQuestions(questions, filters) {
  const safeFilters = {
    search: normalizeText(filters && filters.search),
    category: (filters && filters.category) || "all",
    difficulty: (filters && filters.difficulty) || "all",
    highFrequencyOnly: Boolean(filters && filters.highFrequencyOnly)
  };

  return questions.filter((item) => {
    const searchHaystack = [
      item.question,
      ...(item.keywords || []),
      ...(item.answerPoints || [])
    ]
      .map(normalizeText)
      .join(" ");

    const matchesSearch =
      !safeFilters.search || searchHaystack.includes(safeFilters.search);
    const matchesCategory =
      safeFilters.category === "all" || item.category === safeFilters.category;
    const matchesDifficulty =
      safeFilters.difficulty === "all" ||
      item.difficulty === safeFilters.difficulty;
    const matchesHighFrequency =
      !safeFilters.highFrequencyOnly || Boolean(item.highFrequency);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDifficulty &&
      matchesHighFrequency
    );
  });
}

function getQuestionStats(questions) {
  return {
    total: questions.length,
    categories: new Set(questions.map((item) => item.category)).size,
    highFrequency: questions.filter((item) => item.highFrequency).length
  };
}

function getHeroStatItems(stats, visibleCount) {
  return [
    { value: stats.total, label: "题目总数", shortLabel: "总数" },
    { value: stats.categories, label: "专题数量", shortLabel: "专题" },
    { value: stats.highFrequency, label: "高频题", shortLabel: "高频" },
    { value: visibleCount, label: "当前结果", shortLabel: "结果" }
  ];
}

function getHeroDescriptions() {
  return {
    full:
      "把高频八股、系统知识、通信专项和项目表达题，整理成一个可浏览、可随机练习、可直接部署到 GitHub Pages 的轻量面试 Web App。",
    compact: "把高频题和专题题整理成一个适合手机刷题与随机练习的轻量题库。"
  };
}

function groupQuestionsByCategory(questions) {
  return questions.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});
}

function getUniqueValues(questions, field) {
  return Array.from(new Set(questions.map((item) => item[field])));
}

function formatDifficulty(value) {
  const labels = {
    basic: "基础",
    intermediate: "进阶",
    advanced: "高阶"
  };

  return labels[value] || value;
}

function createPracticeState(questions, filters, startIndex) {
  const pool = filterQuestions(questions, filters);
  const safeIndex =
    typeof startIndex === "number" && startIndex >= 0 && startIndex < pool.length
      ? startIndex
      : 0;

  return {
    pool: pool,
    currentIndex: safeIndex,
    revealAnswer: false
  };
}

function movePracticeIndex(currentIndex, length, direction) {
  const nextIndex = currentIndex + direction;

  if (length <= 0) {
    return 0;
  }

  if (nextIndex < 0) {
    return 0;
  }

  if (nextIndex >= length) {
    return length - 1;
  }

  return nextIndex;
}

function getRandomIndex(length) {
  if (length <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * length);
}

function createOptions(values, defaultLabel) {
  return ['<option value="all">' + defaultLabel + "</option>"]
    .concat(
      values.map((value) => {
        return (
          '<option value="' +
          escapeHtml(value) +
          '">' +
          escapeHtml(formatDifficulty(value) === value ? value : formatDifficulty(value)) +
          "</option>"
        );
      })
    )
    .join("");
}

function renderQuestionCard(item, forceOpen) {
  const answerList = item.answerPoints
    .map((point) => "<li>" + escapeHtml(point) + "</li>")
    .join("");

  const keywords = item.keywords
    .map((keyword) => '<span class="chip chip-muted">' + escapeHtml(keyword) + "</span>")
    .join("");

  return [
    '<article class="question-card">',
    '  <details' + (forceOpen ? " open" : "") + ">",
    '    <summary class="question-summary">',
    '      <div class="question-meta">',
    '        <span class="chip chip-accent">' +
      escapeHtml(formatDifficulty(item.difficulty)) +
      "</span>",
    item.highFrequency
      ? '        <span class="chip chip-hot">高频</span>'
      : '        <span class="chip chip-muted">延伸</span>',
    "      </div>",
    '      <h3 class="question-title">' + escapeHtml(item.question) + "</h3>",
    "    </summary>",
    '    <div class="question-body">',
    '      <div class="keyword-row">' + keywords + "</div>",
    '      <ul class="answer-points">' + answerList + "</ul>",
    "    </div>",
    "  </details>",
    "</article>"
  ].join("");
}

function renderCategoryNavigation(categories, counts) {
  return categories
    .map((category) => {
      return (
        '<a class="nav-chip" href="#' +
        escapeHtml(slugify(category)) +
        '">' +
        escapeHtml(category) +
        '<span class="nav-chip-count">' +
        escapeHtml(counts[category] || 0) +
        "</span>" +
        "</a>"
      );
    })
    .join("");
}

function renderSections(questions, forceOpen) {
  const groups = groupQuestionsByCategory(questions);

  return Object.keys(groups)
    .map((category) => {
      const cards = groups[category]
        .map((item) => renderQuestionCard(item, forceOpen))
        .join("");
      return [
        '<section class="category-section" id="' + escapeHtml(slugify(category)) + '">',
        '  <div class="section-header">',
        "    <h2>" + escapeHtml(category) + "</h2>",
        "    <p>" + groups[category].length + " 道题</p>",
        "  </div>",
        '  <div class="question-grid">' + cards + "</div>",
        "</section>"
      ].join("");
    })
    .join("");
}

function getCategoryCounts(questions) {
  return questions.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});
}

function getCapabilityHint(category) {
  const hints = {
    "C++ 基础": "语法、对象模型、语言基础",
    "面向对象": "继承、多态、设计原则",
    "内存管理": "RAII、生命周期、资源所有权",
    STL: "容器、算法、复杂度与失效规则",
    "现代 C++": "C++11/14/17、并发、模板、工程语义",
    "Linux 基础": "权限、系统接口、运行环境",
    "进程与线程": "调度模型、上下文切换、线程基础",
    "同步与并发": "锁、原子、等待唤醒与死锁",
    "IPC 与网络": "socket、共享内存、事件模型",
    "调试与排障": "定位思路、工具链、问题复盘",
    "性能优化": "瓶颈分析、缓存、系统开销",
    "通信与嵌入式专项": "协议理解、实时性、资源约束",
    "项目深挖": "架构表达、取舍、结果复盘",
    "HR / 场景表达": "沟通表达、协作方式、职业判断"
  };

  return hints[category] || "查看该专题";
}

function renderCapabilityMap(categories, counts) {
  return categories
    .map((category) => {
      return [
        '<button class="capability-card" type="button" data-jump-category="' +
          escapeHtml(category) +
          '">',
        '  <span class="capability-card-title">' + escapeHtml(category) + "</span>",
        '  <span class="capability-card-count">' + escapeHtml(counts[category] || 0) + " 题</span>",
        '  <span class="capability-card-hint">' + escapeHtml(getCapabilityHint(category)) + "</span>",
        "</button>"
      ].join("");
    })
    .join("");
}

function renderPracticePanel(state) {
  if (!state.practice.pool.length) {
    return [
      '<section class="practice-shell empty-state">',
      "  <h2>练习模式</h2>",
      "  <p>当前筛选条件下没有题目。请先放宽筛选，再进入练习模式。</p>",
      "</section>"
    ].join("");
  }

  const currentQuestion = state.practice.pool[state.practice.currentIndex];
  const answerList = currentQuestion.answerPoints
    .map((point) => "<li>" + escapeHtml(point) + "</li>")
    .join("");

  return [
    '<section class="practice-shell">',
    '  <div class="practice-header">',
    "    <div>",
    "      <h2>练习模式</h2>",
    "      <p>先自己回答，再点开参考答案。当前题池基于你现有筛选条件。</p>",
    "    </div>",
    '    <div class="practice-progress">' +
      escapeHtml(state.practice.currentIndex + 1) +
      " / " +
      escapeHtml(state.practice.pool.length) +
      "</div>",
    "  </div>",
    '  <div class="practice-card">',
    '    <div class="question-meta">',
    '      <span class="chip chip-accent">' +
      escapeHtml(currentQuestion.category) +
      "</span>",
    '      <span class="chip chip-muted">' +
      escapeHtml(formatDifficulty(currentQuestion.difficulty)) +
      "</span>",
    currentQuestion.highFrequency
      ? '      <span class="chip chip-hot">高频</span>'
      : "",
    "    </div>",
    '    <h3 class="practice-question">' + escapeHtml(currentQuestion.question) + "</h3>",
    '    <div class="keyword-row">' +
      currentQuestion.keywords
        .map((keyword) => '<span class="chip chip-muted">' + escapeHtml(keyword) + "</span>")
        .join("") +
      "</div>",
    '    <div class="practice-actions">',
    '      <button class="primary-button" type="button" data-practice-reveal="true">' +
      (state.practice.revealAnswer ? "隐藏参考答案" : "显示参考答案") +
      "</button>",
    '      <button class="secondary-button" type="button" data-practice-random="true">随机换一题</button>',
    '      <button class="secondary-button" type="button" data-practice-step="-1">上一题</button>',
    '      <button class="secondary-button" type="button" data-practice-step="1">下一题</button>',
    "    </div>",
    state.practice.revealAnswer
      ? '    <div class="practice-answer"><ul class="answer-points">' + answerList + "</ul></div>"
      : '    <div class="practice-answer-placeholder">先尝试自己组织回答，再点击按钮查看参考要点。</div>',
    "  </div>",
    "</section>"
  ].join("");
}

function renderModeSwitcher(mode) {
  return [
    '<div class="mode-switcher">',
    '  <button class="' +
      (mode === "browse" ? "mode-button is-active" : "mode-button") +
      '" type="button" data-mode="browse">浏览模式</button>',
    '  <button class="' +
      (mode === "practice" ? "mode-button is-active" : "mode-button") +
      '" type="button" data-mode="practice">练习模式</button>',
    "</div>"
  ].join("");
}

function renderApp(container, questions, state) {
  const categories = getUniqueValues(questions, "category");
  const difficulties = getUniqueValues(questions, "difficulty");
  const filteredQuestions = filterQuestions(questions, state.filters);
  const stats = getQuestionStats(questions);
  const visibleCount = filteredQuestions.length;
  const categoryCounts = getCategoryCounts(questions);
  const heroStatItems = getHeroStatItems(stats, visibleCount);
  const heroDescriptions = getHeroDescriptions();
  const browsePanel = [
    '<section class="browse-panel">',
    '  <div class="panel-header">',
    "    <div>",
    "      <h2>浏览模式</h2>",
    "      <p>按专题系统复习，结合高频筛选和展开回答快速过题。</p>",
    "    </div>",
    '    <div class="panel-actions">',
    '      <button class="secondary-button" type="button" data-expand="all">展开全部</button>',
    '      <button class="secondary-button" type="button" data-expand="none">收起全部</button>',
    "    </div>",
    "  </div>",
    '<section class="quick-nav">',
    "  <h2>专题入口</h2>",
    '  <div class="nav-chip-list">' + renderCategoryNavigation(categories, categoryCounts) + "</div>",
    "</section>",
    '<section class="results-summary">',
    "  <p>当前筛选后共有 <strong>" +
      visibleCount +
      "</strong> 道题。建议先刷高频题，再切到练习模式做随机抽题。</p>",
    "</section>",
    '<section class="category-list">' + renderSections(filteredQuestions, state.expandAll) + "</section>",
    "</section>"
  ].join("");

  container.innerHTML = [
    '<section class="hero hero-showcase">',
    '  <div class="hero-copy">',
    '    <p class="eyebrow">Portfolio Mini Web App</p>',
    "    <h1>C++ / Linux / 通信开发面试题库</h1>",
    '    <p><span class="hero-description-full">' +
      escapeHtml(heroDescriptions.full) +
      '</span><span class="hero-description-compact">' +
      escapeHtml(heroDescriptions.compact) +
      "</span></p>",
    '    <div class="hero-actions">',
    '      <button class="primary-button" type="button" data-hero-action="browse">开始刷题</button>',
    '      <button class="secondary-button" type="button" data-hero-action="practice">随机练习</button>',
    '      <button class="secondary-button" type="button" data-hero-action="high-frequency">只看高频</button>',
    "    </div>",
    "  </div>",
    '  <div class="hero-stats">',
    heroStatItems
      .map((item) => {
        return (
          '<div class="stat-card"><strong>' +
          escapeHtml(item.value) +
          '</strong><span class="stat-label-full">' +
          escapeHtml(item.label) +
          '</span><span class="stat-label-short">' +
          escapeHtml(item.shortLabel) +
          "</span></div>"
        );
      })
      .join(""),
    "  </div>",
    "</section>",
    '<section class="capability-map">',
    "  <div class=\"panel-header\"><div><h2>能力地图</h2><p>按模块跳转，快速查看每个专题覆盖的题量。</p></div></div>",
    '  <div class="capability-grid">' + renderCapabilityMap(categories, categoryCounts) + "</div>",
    "</section>",
    renderModeSwitcher(state.mode),
    '<section class="controls-panel">',
    '  <div class="control-field control-search">',
    '    <label for="search-input">关键词搜索</label>',
    '    <input id="search-input" type="search" placeholder="例如：epoll、智能指针、共享内存" value="' +
      escapeHtml(state.filters.search) +
      '" />',
    "  </div>",
    '  <div class="control-field">',
    '    <label for="category-select">分类</label>',
    '    <select id="category-select">' +
      createOptions(categories, "全部分类") +
      "</select>",
    "  </div>",
    '  <div class="control-field">',
    '    <label for="difficulty-select">难度</label>',
    '    <select id="difficulty-select">' +
      createOptions(difficulties, "全部难度") +
      "</select>",
    "  </div>",
    '  <label class="toggle-field" for="high-frequency-toggle">',
    '    <input id="high-frequency-toggle" type="checkbox"' +
      (state.filters.highFrequencyOnly ? " checked" : "") +
      " />",
    "    <span>只看高频题</span>",
    "  </label>",
    "</section>",
    state.mode === "browse" ? browsePanel : renderPracticePanel(state),
    '<section class="review-guide">',
    "  <h2>复习建议</h2>",
    "  <ol>",
    "    <li>先按浏览模式系统过一遍基础模块，建立完整知识地图。</li>",
    "    <li>再切到练习模式，用随机抽题训练临场表达，而不是只看答案。</li>",
    "    <li>最后重点刷通信专项、项目深挖和 HR 场景题，把“会做题”升级成“会讲项目”。</li>",
    "  </ol>",
    "</section>",
    '<footer class="site-footer">',
    "  <p>本项目保持纯静态实现，适合直接发布到 GitHub Pages 的 `docs/` 目录。</p>",
    "  <p>目标公开仓库为 `kanjiang/cpp-linux-interview-handbook`，适合作为面试相关的公开作品集项目。</p>",
    "</footer>"
  ].join("");

  const categorySelect = container.querySelector("#category-select");
  const difficultySelect = container.querySelector("#difficulty-select");

  if (categorySelect) {
    categorySelect.value = state.filters.category;
  }

  if (difficultySelect) {
    difficultySelect.value = state.filters.difficulty;
  }
}

function mountInterviewSite(globalScope) {
  const questions = globalScope.INTERVIEW_QUESTIONS || [];
  const container = globalScope.document && globalScope.document.getElementById("app");

  if (!container || !questions.length) {
    return;
  }

  const state = {
    mode: "browse",
    expandAll: false,
    filters: {
      search: "",
      category: "all",
      difficulty: "all",
      highFrequencyOnly: false
    },
    practice: createPracticeState(questions, {
      search: "",
      category: "all",
      difficulty: "all",
      highFrequencyOnly: false
    })
  };

  function refreshPractice(startIndex) {
    state.practice = createPracticeState(questions, state.filters, startIndex);
  }

  function rerender() {
    renderApp(container, questions, state);

    const searchInput = container.querySelector("#search-input");
    const categorySelect = container.querySelector("#category-select");
    const difficultySelect = container.querySelector("#difficulty-select");
    const highFrequencyToggle = container.querySelector("#high-frequency-toggle");
    const expandButtons = container.querySelectorAll("[data-expand]");
    const modeButtons = container.querySelectorAll("[data-mode]");
    const heroActions = container.querySelectorAll("[data-hero-action]");
    const capabilityButtons = container.querySelectorAll("[data-jump-category]");
    const practiceRevealButton = container.querySelector("[data-practice-reveal]");
    const practiceRandomButton = container.querySelector("[data-practice-random]");
    const practiceStepButtons = container.querySelectorAll("[data-practice-step]");

    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.filters.search = event.target.value;
        refreshPractice();
        rerender();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", function (event) {
        state.filters.category = event.target.value;
        refreshPractice();
        rerender();
      });
    }

    if (difficultySelect) {
      difficultySelect.addEventListener("change", function (event) {
        state.filters.difficulty = event.target.value;
        refreshPractice();
        rerender();
      });
    }

    if (highFrequencyToggle) {
      highFrequencyToggle.addEventListener("change", function (event) {
        state.filters.highFrequencyOnly = event.target.checked;
        refreshPractice();
        rerender();
      });
    }

    expandButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.expandAll = button.getAttribute("data-expand") === "all";
        rerender();
      });
    });

    modeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.mode = button.getAttribute("data-mode");
        if (state.mode === "practice") {
          refreshPractice();
        }
        rerender();
      });
    });

    heroActions.forEach(function (button) {
      button.addEventListener("click", function () {
        const action = button.getAttribute("data-hero-action");

        if (action === "browse") {
          state.mode = "browse";
        } else if (action === "practice") {
          state.mode = "practice";
          refreshPractice(getRandomIndex(filterQuestions(questions, state.filters).length));
        } else if (action === "high-frequency") {
          state.mode = "browse";
          state.filters.highFrequencyOnly = true;
          refreshPractice();
        }

        rerender();
      });
    });

    capabilityButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.mode = "browse";
        state.filters.category = button.getAttribute("data-jump-category");
        refreshPractice();
        rerender();
        if (globalScope.location) {
          globalScope.location.hash = slugify(state.filters.category);
        }
      });
    });

    if (practiceRevealButton) {
      practiceRevealButton.addEventListener("click", function () {
        state.practice.revealAnswer = !state.practice.revealAnswer;
        rerender();
      });
    }

    if (practiceRandomButton) {
      practiceRandomButton.addEventListener("click", function () {
        if (!state.practice.pool.length) {
          return;
        }
        state.practice.currentIndex = getRandomIndex(state.practice.pool.length);
        state.practice.revealAnswer = false;
        rerender();
      });
    }

    practiceStepButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.practice.currentIndex = movePracticeIndex(
          state.practice.currentIndex,
          state.practice.pool.length,
          Number(button.getAttribute("data-practice-step"))
        );
        state.practice.revealAnswer = false;
        rerender();
      });
    });
  }

  rerender();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      mountInterviewSite(window);
    });
  } else {
    mountInterviewSite(window);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeText,
    filterQuestions,
    createPracticeState,
    movePracticeIndex,
    getQuestionStats,
    getHeroDescriptions,
    groupQuestionsByCategory,
    getUniqueValues,
    slugify,
    getCapabilityHint,
    getHeroStatItems
  };
}
