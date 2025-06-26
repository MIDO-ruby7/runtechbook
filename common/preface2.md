---
title: "Vivliostyle + Markdown ドキュメントガイド"
author: "midori"
---

## Vivliostyle + Markdown ドキュメントガイド

## 📝 基本的なMarkdown記法

### 見出し

```markdown
# 見出し1（h1）
## 見出し2（h2）
### 見出し3（h3）
````

# 見出し1（h1）
## 見出し2（h2）
### 見出し3（h3）

### 段落・改行

段落は空行で区切ります。
改行は行末に半角スペースを2つ入れます。

### 強調

```markdown
*斜体* または _斜体_
**太字** または __太字__
```

*斜体* または _斜体_
**太字** または __太字__

### リスト

```markdown
- 箇条書き
- 2つ目
  - ネストされたリスト

1. 番号付きリスト
2. 2つ目
```

- 箇条書き
- 2つ目
  - ネストされたリスト

1. 番号付きリスト
2. 2つ目

### リンク・画像

```markdown
[リンクテキスト](https://example.com)
![代替テキスト](image.png)
```

[リンクテキスト](https://example.com)
![代替テキスト](image.png)

画像の幅を指定するには次のように記述します：

```markdown
![説明文](image.png){style="width:70%;"}
```
![説明文](image.png){style="width:70%;"}

### コード

インラインコード：

```markdown
これは `コード` です。
```

これは `コード` です。

コードブロック：

<pre>
```
console.log("Hello Vivliostyle!");
```
</pre>

```
console.log("Hello Vivliostyle!");
```

### 注釈
```
これは注釈付きの文章です[^1]。

[^1]: これは脚注の内容です。
```

これは注釈付きの文章です[^1]。

[^1]: これは脚注の内容です。

### HTMLとの併用

VivliostyleではHTMLも使用可能です：

```html
<div class="custom-box">
  カスタムスタイルのボックス
</div>
```

CSSを用いて装飾：

```css
.custom-box {
  border: 1px solid #ccc;
  padding: 1em;
  background-color: #f9f9f9;
}
```

---

## 📄 VivliostyleでPDF出力する流れ

1. Markdown（.md）ファイルを作成
2. Vivliostyle CLI または Vivliostyle Pub を使用してHTMLに変換
3. ブラウザでHTMLを開き、印刷またはPDFとして出力（Chrome推奨）

---

## 🧩 参考リンク

* [Vivliostyle公式サイト](https://vivliostyle.org/)
* [VFM仕様ドキュメント](https://github.com/vivliostyle/vfm)
* [Vivliostyle CLI](https://github.com/vivliostyle/vivliostyle-cli)

