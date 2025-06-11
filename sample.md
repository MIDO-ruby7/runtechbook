---
title: "CSS制御テスト"
author: "著者名"
---

# 表紙

<div class="cover">
  <h1>本のタイトル</h1>
</div>

<div style="page-break-after: always;"></div>

# 目次

<nav role="doc-toc">
- [1章 単段組セクション](#chapter-one)
- [2章 段組セクション](#chapter-two)
- [3章 背景色と画像](#chapter-bg)
</nav>

<div style="page-break-after: always;"></div>

# 第1章 単段組セクション {#chapter-one}

::: one-column

これは単段組（column-count: 1）で書かれたセクションです。  
Markdownの基本要素も使えます：

- リスト項目
- **強調**
- [リンク](https://vivliostyle.org)

ここで改ページしてみます。

:::

<div style="page-break-after: always;"></div>

# 第2章 段組セクション {#chapter-two}

::: two-column

これは二段組のセクションです。段組はCSSの `.two-column` で制御しています。

```python
# これはコードブロックです
print("Hello, column world!")
