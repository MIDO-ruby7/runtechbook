# 📚 RUNTEQ技術同人誌 - 原稿執筆ガイド

このプロジェクトでは、"エンジニアらしく技術書を書く"ということをテーマに、**Markdown 原稿を GitHub で提出**して頂きます。

## 🚀 クイックスタート

### 1. Bunのインストール
このプロジェクトでは高速なJavaScriptランタイム「Bun」を使用します。

```bash
# macOS/Linux
brew install oven-sh/bun/bun

# Windows (PowerShell管理者権限で実行)
scoop install bun
```
npm でのinstallも使用可能です。

詳細は[Bun公式ドキュメント](https://bun.sh/docs/installation)を参照してください。

### 2. リポジトリのセットアップ
まずは、本リポジトリをフォークしてください。

```bash
# リポジトリをフォーク後、クローン
git clone https://github.com/あなたのアカウント/runtechbook.git
cd runtechbook

# 依存関係をインストール
bun install

# 開発サーバーを起動（プレビュー確認）
bun run dev

# PDF出力（印刷状態の確認）
bun run build
```

## ✍️ 執筆を始める前に

### 1. テンプレートをコピーして執筆開始

```bash
# 例：NESTテーマで執筆する場合
cp テンプレート.md nest/卒業期-あなたの名前.md
```

### 2. ファイル冒頭に必ず以下を記入

```markdown
---
title: "あなたの記事タイトル"
author: "あなたの名前"
---
```

この情報は目次の自動生成に使用されます。

## 📖 Vivliostyle + Markdown ガイド

Markdownの詳しい書き方やVivliostyleの使い方については、以下のガイドを参照してください：

👉 **[Vivliostyle + Markdown ドキュメントガイド](common/preface2.md)**

このガイドには以下の内容が含まれています：
- 基本的なMarkdown記法
- Vivliostyle特有の機能
- 画像の挿入方法
- ページレイアウトの調整方法

## ✍️ 執筆方法

**Markdown 形式**で原稿を書き、**Vivliostyle.js**を用いて本の形に組版します。

### Vivliostyle とは？

- Markdown → HTML に変換し、CSS で紙面のようなレイアウトを適用できるツール
- Vivliostyle.js を使うことで、**ブラウザ上でプレビューしながら組版**できます
- Markdown 内で HTML を使うこともできるため、**独自のクラス指定や装飾**も可能です

### 執筆の流れ（おすすめ手順）

1. **まずは Qiita / Zenn / GitHub などで執筆**

   - プレビューのしやすさ
   - アップロード画像がそのまま使用可能
   - 同人誌頒布後、自分の記事を公開できる

   以上3点から、これらのサービスの下書き機能を利用して記事を書き上げるのがおすすめです。

2. **リポジトリをフォークする**

   以下の URL から、公式リポジトリをフォークしてください：

   👉 [https://github.com/MIDO-ruby7/runtechbook](https://github.com/MIDO-ruby7/runtechbook)

   GitHub アカウントでログイン後、「Fork」ボタンを押して、自分のアカウントにコピーを作成します。

3. **原稿ファイルを追加する**

  - ブランチを切ります。(ブランチ名は任意で良いです)

  - **テンプレートをコピーして執筆開始**：
    ```bash
    # テンプレートをコピー（例：NESTテーマの場合）
    cp テンプレート.md nest/37-yourname.md
    ```

  - 執筆するテーマに応じて、以下のディレクトリに Markdown ファイルを追加してください：

    | テーマ               | ディレクトリ                          | 例                  |
    | -------------------- | ------------------------------------- | ------------------- |
    | NEST                 | `nest/`                               | `nest/37-midori.md` |
    | HUB                  | `hub/`                                | `hub/37-midori.md`  |
    | 自由（フリーテーマ） | `free/`                               | `free/37-midori.md` |


    ファイル名は `卒業期-名前.md` 形式でお願いします。RUNTEQ運営の方はお名前だけで大丈夫です。
    （例：`37-midori.md`, `hisaju.md`）

  - 次に、応募するテーマのフォルダ内にある.jsファイルに自分の記事のpath, タイトル, 適用させたいCSSファイル名を追記します(カスタマイズしたい場合以外はbase.cssでOKです)。
    ```
    {
      path: 'free/37-midori.md',
      title: '記事のタイトル',
      theme: './styles/base.css'
    }
    ```

  - `$ bun run dev` で起動し、表現や段落、画像サイズ、位置などを本らしく整えていきます。
    
    **💡 プレビューについて**
    - `bun run dev` を実行すると、ブラウザで http://localhost:3000 が開きます
    - Markdownファイルを編集すると、**リアルタイムでプレビューが更新**されます
    - 実際の本のレイアウトを確認しながら執筆できます

4. **詳しい書き方は Vivliostyle ガイドを参照**

   👉 **[Vivliostyle + Markdown ドキュメントガイド](common/preface2.md)**

## 📤 提出方法

### 1. ⚠️ 重要：記事冒頭の設定
**必ず**ご自身の.mdファイルの冒頭に以下を追記してください：

```markdown
---
title: "記事のタイトル"
author: "あなたの名前"
---
```

> **注意**: この設定がないと目次に記事が表示されません！
> `script/generate-toc.ts`がこの情報を使って目次を自動生成します。

### 2. ビルドして出力を確認
```bash
bun run build
```
PDFが生成されるので、以下を確認してください：
- エラーが出ていないか
- レイアウトが崩れていないか
- 印刷プレビューで白黒にしてみて、見えづらいところがないか
- **目次にご自身の記事と名前が載っているか**

### 3. Pull Requestを作成

執筆が完了したら、`main` ブランチに対して Pull Request を作成してください。

PR タイトル例：

```
Add: 「Next.jsで作るAIチャット」 by @midori（NEST）
```

PR 本文には、以下を記載いただけると嬉しいです：

- 執筆テーマ（NEST / HUB / フリー）
- 記事の概要（2〜3 行）

---

運営にて誤字脱字等の確認後、PRをマージします。

## 💡 補足：RUNTEQ はいいぞパート

後日フォーム or 特定ファイルへの追記で募集予定です。
詳細は Discord にてお知らせします。

---

## 🧾 FAQ（よくある質問）

**Q. Bun じゃなくて npm/yarn/pnpm じゃダメですか？**
A. npm/yarn/pnpm などでも良いです。その場合、package.jsonのスクリプトが Bun 前提のため、修正してお使いください。また、lockファイルをPRに含めないようご注意ください。

**Q. ローカルでの画像の挿入は可能ですか？**
A. 可能です。`images/` フォルダに配置し、Markdown 内で相対パスで参照してください。

**Q. 記事が途中でも PR していいですか？**
A. 大歓迎です！途中でも「草稿」として PR しておいてもらえると、編集調整や構成のご相談がしやすくなります。
