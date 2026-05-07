# C++ / Linux / EDA / 半导体软件面试题库

这是一个可直接部署到 GitHub Pages 的轻量 Web App 版面试题库，适合 `C++ / Linux / 测试开发 / EDA / 半导体软件` 岗位复习，也适合作为公开展示的前端小项目。

## 目录结构

```text
cpp-linux-interview-handbook/
  README.md
  docs/
    index.html
    style.css
    script.js
    questions.js
    script.test.js
```

页面能力包括：

- `150+` 道题
- 浏览模式
- 练习模式
- 随机抽题
- 分类能力地图
- 关键词搜索
- 分类 / 难度 / 高频筛选
- 展开全部 / 收起全部
- 每道题附标准回答要点

## 本地预览

最简单的方式是直接在浏览器中打开：

- `docs/index.html`

如果你更习惯本地 HTTP 服务，也可以在仓库根目录执行：

```bash
python3 -m http.server 8000
```

然后访问：

- `http://localhost:8000/docs/`

## 自动化检查

当前页面逻辑包含一个轻量级 Node 测试文件，用于校验：

- 题库规模
- 搜索与筛选逻辑
- 练习模式题池构造
- 统计信息计算

```bash
node --test docs/script.test.js
```

## GitHub Pages 部署

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
