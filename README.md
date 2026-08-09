# C++ / Linux / EDA / 半导体软件面试题库

这是一个可直接部署到 GitHub Pages 的轻量 Web App 版面试题库，适合 `C++ / Linux / 测试开发 / EDA / 半导体软件` 岗位复习，也适合作为公开展示的前端小项目。

## 目录结构

```text
cpp-linux-interview-handbook/
  README.md
  docs/
    index.html
    hundsun.html
    style.css
    script.js
    questions.js
    script.test.js
    pages.test.js
```

页面能力包括：

- `320+` 道题，`30+` 个专题
- 浏览模式
- 练习模式
- 随机抽题
- 分类能力地图
- 关键词搜索
- 分类 / 难度 / 高频 / 公司轨道筛选
- 展开全部 / 收起全部
- 每道题附标准回答要点
- 七篇图解笔记，共 `34` 张内联 SVG 示意图（内存布局、缓存行、epoll 内部结构、锁与死锁、火焰图等）
- 恒生经纪业务 C++ 岗准备页（技能清单 + JD checklist + 复习路径）

## 本地预览

最简单的方式是直接在浏览器中打开：

- `docs/index.html`
- `docs/hundsun.html`（恒生面试准备）
- `docs/cpp-modern-notes.html`（C++ 核心笔记：引用/转发/lambda 等）
- `docs/cpp-value-semantics.html`（拷贝与移动、五法则、noexcept）
- `docs/cpp-containers-notes.html`（容器与智能指针）
- `docs/cpp-concurrency-notes.html`（并发与线程）
- `docs/cpp-memory-perf-notes.html`（内存对齐、伪共享、内存池、STL 底层）
- `docs/linux-sysprog-notes.html`（epoll / mmap / 信号 / core dump / OOM）
- `docs/debug-tools-notes.html`（gdb / Sanitizer / valgrind / perf / strace）
- `docs/hundsun-uf3-guide.html` / `docs/hundsun-uf3-memo.html`（UF3.0 文档）

如果你更习惯本地 HTTP 服务，也可以在仓库根目录执行：

```bash
python3 -m http.server 8000
```

然后访问：

- `http://localhost:8000/docs/`
- `http://localhost:8000/docs/hundsun.html`
- `http://localhost:8000/docs/index.html?company=hundsun`（预选恒生专题）

## 自动化检查

仓库包含两个轻量级 Node 测试文件。`docs/script.test.js` 校验题库逻辑：

- 题库规模
- 搜索与筛选逻辑
- 练习模式题池构造
- 统计信息计算

`docs/pages.test.js` 校验静态页面本身，重点是那批手写的内联 SVG 示意图：

- 每张图的标签是否闭合（SVG 是 XML 语法，浏览器会静默吞掉错误）
- `url(#id)` 箭头引用是否都能在同一文档里解析到
- 每张图是否带 `aria-label` 与图注
- 页面之间的相对链接与 `?category=` 深链是否都指向真实存在的目标

```bash
node --test docs/
```

## 在线访问

当前站点托管在 GitHub Pages / Vercel。**国内手机网络（即便开了代理）也经常打不开 `github.io` / `vercel.app`**，这通常是网络链路问题，不是页面本身坏了。

可用地址（网络畅通时）：

```text
https://kanjiang.github.io/cpp-linux-interview-handbook/
https://kanjiang.github.io/cpp-linux-interview-handbook/hundsun.html
https://kanjiang.github.io/cpp-linux-interview-handbook/hundsun-uf3-guide.html
https://kanjiang.github.io/cpp-linux-interview-handbook/hundsun-uf3-memo.html
https://kanjiang.github.io/cpp-linux-interview-handbook/cpp-modern-notes.html
```

### 手机现在就要看：同一 Wi‑Fi 本地访问

1. 电脑在仓库根目录执行：`python -m http.server 8000`
2. 电脑执行 `ipconfig`，记下局域网 IP（例如 `192.168.1.8`）
3. 手机浏览器打开：`http://192.168.1.8:8000/docs/` 或 `.../docs/hundsun.html`

若需要国内公网稳定访问，建议改接到 Cloudflare Pages / 国内静态托管；需要的话我可以帮你改一键部署配置。


1. 在 GitHub 新建一个普通仓库，例如 `cpp-linux-interview-handbook`
2. 把当前目录下的全部文件上传到该仓库
3. 打开仓库 `Settings -> Pages`
4. 在 `Build and deployment` 中选择发布分支，例如 `main`
5. 选择发布目录为 `/docs`
6. 保存配置并等待 GitHub Pages 生成访问地址

发布后地址通常类似：

```text
https://kanjiang.github.io/cpp-linux-interview-handbook/
```

## Vercel 部署

仓库已包含根目录 `vercel.json`，会把静态站点输出目录设为 `docs/`。

1. 在 Vercel 导入该 GitHub 仓库
2. Framework Preset 选 `Other`（或保持自动检测）
3. 确认 Output Directory 为 `docs`（一般会被 `vercel.json` 覆盖）
4. 部署完成后访问根路径即可打开题库；恒生准备页路径为 `/hundsun.html`

若 Dashboard 里曾手动改过 Root Directory / Output Directory，以 `vercel.json` 为准，或把 Root Directory 留空、Output Directory 设为 `docs`。

## 题库结构

题库数据都在：

- `docs/questions.js`

每道题的数据结构如下：

```javascript
{
  id: "unique-id",
  category: "分类名",
  difficulty: "basic | intermediate | advanced",
  highFrequency: true,
  question: "题目",
  keywords: ["关键词1", "关键词2"],
  answerPoints: [
    "回答要点 1",
    "回答要点 2",
    "回答要点 3"
  ]
}
```

建议新增题目时保持：

- `id` 唯一
- `answerPoints` 至少 3 条
- 题目表述简洁，适合面试口述
- 回答要点突出区别、原理、适用场景和工程取舍

## 视觉与交互

当前版本采用“作品集风 + 轻量 Web App”的设计方向：

- 首屏突出项目定位和统计信息
- 分类入口做成能力地图
- 浏览模式适合系统复习
- 练习模式适合随机抽题和模拟回答

这样既能作为复习工具，也能作为公开仓库里的展示项目。
