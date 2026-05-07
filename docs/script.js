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

function isCompanyCategory(category) {
  return String(category || "").indexOf("广立微 /") === 0 || category === "芯片 / EDA 公司专项";
}

function matchesCompanyTrack(category, companyTrack) {
  if (!companyTrack || companyTrack === "all") {
    return true;
  }

  if (companyTrack === "company-special") {
    return isCompanyCategory(category);
  }

  if (companyTrack === "guangliwei") {
    return String(category || "").indexOf("广立微 /") === 0;
  }

  if (companyTrack === "guangliwei-coding") {
    return category === "广立微 / 编程题";
  }

  if (companyTrack === "eda-company") {
    return category === "芯片 / EDA 公司专项";
  }

  return true;
}

function getCompanyTrackOptions() {
  return [
    { value: "all", label: "全部题库", description: "恢复完整题库" },
    { value: "company-special", label: "公司专项", description: "只看公司相关专题" },
    { value: "guangliwei", label: "广立微岗位题", description: "广立微全部岗位与业务题" },
    { value: "guangliwei-coding", label: "广立微编程题", description: "常见手写与算法题" },
    { value: "eda-company", label: "芯片 / EDA 公司", description: "华大九天、概伦、芯原等通用题" }
  ];
}

function formatCompanyTrackLabel(value) {
  const option = getCompanyTrackOptions().find((item) => item.value === value);
  return option ? option.label : "全部题库";
}

function filterQuestions(questions, filters) {
  const safeFilters = {
    search: normalizeText(filters && filters.search),
    category: (filters && filters.category) || "all",
    difficulty: (filters && filters.difficulty) || "all",
    companyTrack: (filters && filters.companyTrack) || "all",
    highFrequencyOnly: Boolean(filters && filters.highFrequencyOnly)
  };

  return questions.filter((item) => {
    const searchHaystack = [
      item.question,
      ...(item.keywords || []),
      ...(item.answerPoints || []),
      ...(item.diagramSteps || []),
      ...(item.pitfalls || []),
      ...(item.complexity || []),
      item.cppCode || ""
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
    const matchesCompanyFilter = matchesCompanyTrack(
      item.category,
      safeFilters.companyTrack
    );
    const matchesHighFrequency =
      !safeFilters.highFrequencyOnly || Boolean(item.highFrequency);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDifficulty &&
      matchesCompanyFilter &&
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

function renderAnswerSection(section, openByDefault, useCollapsibleLayout) {
  if (!useCollapsibleLayout) {
    return [
      '<section class="answer-section' +
        (section.variantClass ? " " + section.variantClass : "") +
        '">',
      '  <h4 class="answer-section-title">' + escapeHtml(section.title) + "</h4>",
      section.body,
      "</section>"
    ].join("");
  }

  return [
    '<details class="answer-detail' +
      (section.variantClass ? " " + section.variantClass : "") +
      '"' +
      (openByDefault ? " open" : "") +
      ">",
    '  <summary class="answer-detail-summary">' + escapeHtml(section.title) + "</summary>",
    '  <div class="answer-detail-body">' + section.body + "</div>",
    "</details>"
  ].join("");
}

function renderAnswerContent(item) {
  const sections = [];

  if (item.diagramSteps && item.diagramSteps.length) {
    sections.push({
      title: "图解步骤",
      variantClass: "answer-diagram-section",
      body:
        '<ol class="answer-points answer-diagram-steps">' +
        item.diagramSteps
          .map((point) => "<li>" + escapeHtml(point) + "</li>")
          .join("") +
        "</ol>"
    });
  }

  if (item.answerPoints && item.answerPoints.length) {
    sections.push({
      title: item.diagramSteps || item.cppCode || item.complexity ? "详细思路" : "回答要点",
      body:
        '<ul class="answer-points">' +
        item.answerPoints
          .map((point) => "<li>" + escapeHtml(point) + "</li>")
          .join("") +
        "</ul>"
    });
  }

  if (item.pitfalls && item.pitfalls.length) {
    sections.push({
      title: "易踩坑",
      variantClass: "answer-pitfall-section",
      body:
        '<ul class="answer-points pitfalls-points">' +
        item.pitfalls
          .map((point) => "<li>" + escapeHtml(point) + "</li>")
          .join("") +
        '</ul>'
    });
  }

  if (item.cppCode) {
    sections.push({
      title: "C++ 参考代码",
      body: '<pre class="answer-code-block"><code>' + escapeHtml(item.cppCode) + "</code></pre>"
    });
  }

  if (item.complexity && item.complexity.length) {
    sections.push({
      title: "复杂度说明",
      body:
        '<ul class="answer-points complexity-points">' +
        item.complexity
          .map((point) => "<li>" + escapeHtml(point) + "</li>")
          .join("") +
        "</ul>"
    });
  }

  const useCollapsibleLayout = sections.length > 1;

  return sections
    .map((section, index) => renderAnswerSection(section, index === 0, useCollapsibleLayout))
    .join("");
}

function renderQuestionCard(item, forceOpen) {
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
    renderAnswerContent(item),
    "    </div>",
    "  </details>",
    "</article>"
  ].join("");
}

function renderCategoryNavigation(categories, counts) {
  return categories
    .map((category) => {
      return (
        '<button class="nav-chip" type="button" data-category-jump="' +
        escapeHtml(category) +
        '">' +
        escapeHtml(category) +
        '<span class="nav-chip-count">' +
        escapeHtml(counts[category] || 0) +
        "</span>" +
        "</button>"
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
      ? '    <div class="practice-answer">' + renderAnswerContent(currentQuestion) + "</div>"
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
    '<details class="quick-nav quick-nav-details"' + (state.quickNavExpanded ? " open" : "") + '>',
    '  <summary class="quick-nav-toggle">',
    '    <span class="quick-nav-title">专题入口</span>',
    '    <span class="quick-nav-meta">' + visibleCount + ' / ' + stats.total + ' 题</span>',
    "  </summary>",
    '  <div class="nav-chip-list">' + renderCategoryNavigation(categories, categoryCounts) + "</div>",
    "</details>",
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
    "    <h1>C++ / Linux / EDA / 半导体软件面试题库</h1>",
    "    <p>把高频八股、系统知识、半导体 / EDA 岗位专项和项目表达题，整理成一个可浏览、可随机练习、可直接部署到 GitHub Pages 的轻量面试 Web App。</p>",
    '    <div class="hero-actions">',
    '      <button class="primary-button" type="button" data-hero-action="browse">开始刷题</button>',
    '      <button class="secondary-button" type="button" data-hero-action="cpp-knowledge">C++ 知识入口</button>',
    '      <button class="secondary-button" type="button" data-hero-action="practice">随机练习</button>',
    '      <button class="secondary-button" type="button" data-hero-action="high-frequency">只看高频</button>',
    "    </div>",
    "  </div>",
    '  <div class="hero-stats">',
    '    <div class="stat-card"><strong>' + stats.total + '</strong><span>题目总数</span></div>',
    '    <div class="stat-card"><strong>' + stats.categories + '</strong><span>专题数量</span></div>',
    '    <div class="stat-card"><strong>' + stats.highFrequency + '</strong><span>高频题</span></div>',
    '    <div class="stat-card"><strong>' + visibleCount + '</strong><span>当前结果</span></div>',
    "  </div>",
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
    "    <li>最后重点刷半导体 / EDA 专项、项目深挖和 HR 场景题，把“会做题”升级成“会讲项目”。</li>",
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
    quickNavExpanded: false,
    filters: {
      search: "",
      category: "all",
      difficulty: "all",
      companyTrack: "all",
      highFrequencyOnly: false
    },
    practice: createPracticeState(questions, {
      search: "",
      category: "all",
      difficulty: "all",
      companyTrack: "all",
      highFrequencyOnly: false
    })
  };

  function refreshPractice(startIndex) {
    state.practice = createPracticeState(questions, state.filters, startIndex);
  }

  let pendingCategoryScroll = "";

  function rerender() {
    renderApp(container, questions, state);

    const searchInput = container.querySelector("#search-input");
    const categorySelect = container.querySelector("#category-select");
    const difficultySelect = container.querySelector("#difficulty-select");
    const highFrequencyToggle = container.querySelector("#high-frequency-toggle");
    const expandButtons = container.querySelectorAll("[data-expand]");
    const modeButtons = container.querySelectorAll("[data-mode]");
    const heroActions = container.querySelectorAll("[data-hero-action]");
    const quickNavDetails = container.querySelector(".quick-nav-details");
    const categoryJumpButtons = container.querySelectorAll("[data-category-jump]");
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
          state.filters.category = "all";
          state.filters.search = "";
          state.filters.companyTrack = "all";
          state.filters.highFrequencyOnly = false;
        } else if (action === "cpp-knowledge") {
          state.mode = "browse";
          state.filters.category = "C++ 知识直讲";
          state.filters.search = "";
          state.filters.companyTrack = "all";
          state.filters.highFrequencyOnly = false;
          refreshPractice();
        } else if (action === "practice") {
          state.mode = "practice";
          refreshPractice(getRandomIndex(filterQuestions(questions, state.filters).length));
        } else if (action === "high-frequency") {
          state.mode = "browse";
          state.filters.category = "all";
          state.filters.search = "";
          state.filters.highFrequencyOnly = true;
          refreshPractice();
        }

        rerender();
      });
    });

    if (quickNavDetails) {
      quickNavDetails.addEventListener("toggle", function () {
        state.quickNavExpanded = quickNavDetails.open;
      });
    }

    categoryJumpButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const targetCategory = button.getAttribute("data-category-jump");

        state.mode = "browse";
        state.quickNavExpanded = true;
        state.filters.search = "";
        state.filters.category = targetCategory;
        state.filters.difficulty = "all";
        state.filters.companyTrack = "all";
        state.filters.highFrequencyOnly = false;
        pendingCategoryScroll = targetCategory;
        refreshPractice();
        rerender();
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

    if (pendingCategoryScroll) {
      const targetSection = container.querySelector("#" + slugify(pendingCategoryScroll));
      pendingCategoryScroll = "";

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
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
    groupQuestionsByCategory,
    getUniqueValues,
    slugify
  };
}
