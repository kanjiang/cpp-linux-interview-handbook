# 恒生面试准备页 + 专题题库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为恒生「C++开发工程师-经纪业务」增加准备页 `docs/hundsun.html`，并在现有题库中新增可筛选的「恒生 / …」专题题。

**Architecture:** 纯静态站点。准备页复用 `style.css`；题库仍由 `questions.js` 提供数据、`script.js` 负责筛选/渲染。公司轨道逻辑已有雏形，需补上恒生识别、URL 预选与控件 UI。

**Tech Stack:** HTML / CSS / Vanilla JS / Node `node:test`

**Spec:** `docs/superpowers/specs/2026-08-06-hundsun-interview-prep-design.md`

## Global Constraints

- 不改广立微既有题目内容
- 不引入构建工具 / 框架 / 后端
- 题目 id 前缀 `hs-`，分类名 `恒生 / …`
- `answerPoints` 每题 ≥ 3
- 准备页 CTA：`index.html?company=hundsun`
- 视觉复用现有 CSS 变量与蓝系深色 hero

## File Map

| File | Responsibility |
|------|----------------|
| `docs/script.js` | 公司轨道、URL 参数、筛选 UI、首页导航 |
| `docs/script.test.js` | 恒生轨道与数据集断言 |
| `docs/questions.js` | 恒生 6 类题目 |
| `docs/hundsun.html` | 岗位技能与知识储备准备页 |
| `docs/style.css` | 准备页样式 |
| `README.md` | 入口说明 |

---

### Task 1: 恒生公司轨道 + URL 预选 + 控件

**Files:**
- Modify: `docs/script.js`
- Modify: `docs/script.test.js`

**Interfaces:**
- Produces: `isCompanyCategory` 识别 `恒生 /`；`getCompanyTrackOptions` 含 `hundsun`；`readCompanyTrackFromLocation(locationLike)`；controls 中 `#company-track-select`

- [ ] **Step 1: 写失败测试**

在 `docs/script.test.js` 追加：

```javascript
const {
  // existing exports...
  isCompanyCategory,
  matchesCompanyTrack,
  getCompanyTrackOptions,
  readCompanyTrackFromLocation
} = require("./script.js");

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
```

并在 `module.exports` 中导出上述函数（下一步实现）。

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test docs/script.test.js`  
Expected: 新测试 FAIL（未导出 / 未实现）

- [ ] **Step 3: 实现 script.js**

更新要点：

```javascript
function isCompanyCategory(category) {
  const value = String(category || "");
  return (
    value.indexOf("广立微 /") === 0 ||
    value.indexOf("恒生 /") === 0 ||
    category === "芯片 / EDA 公司专项"
  );
}

function matchesCompanyTrack(category, companyTrack) {
  // ...existing...
  if (companyTrack === "hundsun") {
    return String(category || "").indexOf("恒生 /") === 0;
  }
  // ...
}

function getCompanyTrackOptions() {
  return [
    // existing options...
    { value: "hundsun", label: "恒生岗位题", description: "恒生经纪业务 C++ 岗专项" }
  ];
}

function readCompanyTrackFromLocation(locationLike) {
  const search = (locationLike && locationLike.search) || "";
  const params = new URLSearchParams(search.charAt(0) === "?" ? search : "?" + search);
  const company = params.get("company");
  const valid = getCompanyTrackOptions().some((item) => item.value === company);
  return valid ? company : "all";
}
```

在 `controls-panel` 增加公司轨道 `<select id="company-track-select">`，绑定 change；`mountInterviewSite` 初始化：

```javascript
companyTrack: readCompanyTrackFromLocation(globalScope.location || { search: "" })
```

Hero 增加链接按钮：

```html
<a class="secondary-button" href="./hundsun.html">恒生面试准备</a>
```

复习建议增加恒生一条。导出新函数。

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test docs/script.test.js`  
Expected: PASS（除尚未添加的恒生题目断言外）

---

### Task 2: 写入恒生专题题目

**Files:**
- Modify: `docs/questions.js`（在 `"芯片 / EDA 公司专项"` 之前或之后插入 6 个分类）
- Modify: `docs/script.test.js`

**Interfaces:**
- Produces: 分类名精确为：
  - `恒生 / 岗位与业务`
  - `恒生 / C++与内存`
  - `恒生 / Linux与调试`
  - `恒生 / 并发与进程`
  - `恒生 / 数据库基础`
  - `恒生 / 系统设计`
- 每题 `id` 以 `hs-` 开头，合计 ≥ 30 题

- [ ] **Step 1: 写数据集断言**

```javascript
test("questions dataset includes Hundsun company categories", () => {
  const categories = new Set(questions.map((item) => item.category));
  [
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
```

- [ ] **Step 2: 跑测试确认失败**

Expected: FAIL（分类不存在）

- [ ] **Step 3: 写入 ≥30 题**

覆盖 JD：全内存交易、C/C++、内存、Linux、gdb、多线程/进程、事务、索引、系统设计、排障、证券业务加分项。风格对齐广立微口述要点。

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test docs/script.test.js`  
Expected: PASS

---

### Task 3: 准备页 + 样式 + README

**Files:**
- Create: `docs/hundsun.html`
- Modify: `docs/style.css`
- Modify: `README.md`

- [ ] **Step 1: 创建 `docs/hundsun.html`**

区块：岗位概览、JD checklist（职责/要求/加分）、技能地图、复习路径、加分项、CTA `index.html?company=hundsun`、返回题库。

- [ ] **Step 2: 追加 `.hundsun-page` 相关样式到 `style.css`**

复用现有 token；准备页 body 可加 `class="hundsun-page"`。

- [ ] **Step 3: 更新 README**

补充结构树中的 `hundsun.html` 与访问说明。

- [ ] **Step 4: 手工验证**

- 打开 `docs/hundsun.html`
- 打开 `docs/index.html?company=hundsun`，确认只显示恒生题
- `node --test docs/script.test.js` 全绿

---

## Spec Coverage Checklist

- [x] 准备页岗位概览 / JD checklist / 技能地图 / 复习路径 / 加分项 → Task 3
- [x] 6 个恒生分类 + 30–40 题 → Task 2
- [x] 公司轨道 `hundsun` + company-special 含恒生 → Task 1
- [x] URL `?company=hundsun` → Task 1
- [x] 首页 ↔ 准备页导航 → Task 1 + 3
- [x] 测试覆盖 → Task 1 + 2
- [x] README → Task 3
