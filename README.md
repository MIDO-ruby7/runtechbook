# 原稿執筆・提出の流れ

このプロジェクトでは、"エンジニアらしく技術書を書く"ということをテーマに、**Markdown 原稿を GitHub で提出**して頂きます。

## ✍️ 執筆方法

**Markdown 形式**で原稿を書き、**Vivliostyle.js**を用いて本の形に組版します。

#### Vivliostyle とは？

- Markdown → HTML に変換し、CSS で紙面のようなレイアウトを適用できるツール
- Vivliostyle.js を使うことで、**ブラウザ上でプレビューしながら組版**できます
- Markdown 内で HTML を使うこともできるため、**独自のクラス指定や装飾**も可能です

### 執筆の流れ（おすすめ手順）

1. **まずは Qiita / Zenn / GitHub などで執筆**

   - プレビューのしやすさ
   - アップロード画像がそのまま使用可能
   - 同人誌頒布後、自分の記事を公開できる

   以上3点から、これらのサービスの下書き機能を利用して記事を書き上げるのがおすすめです。

2. **環境構築**

   2-1. **Bunのインストール**

   新しい技術に触れる機会になればと考え、Bun を使用しています。
   公式 Doc に Mac or Windows のインストール方法が載っていますので各自インストールをお願いします。

    2-2. **リポジトリをフォークする**

    以下の URL から、公式リポジトリをフォークしてください：

    👉 [https://github.com/MIDO-ruby7/runtechbook](https://github.com/MIDO-ruby7/runtechbook)

    GitHub アカウントでログイン後、「Fork」ボタンを押して、自分のアカウントにコピーを作成します。

    2-3. **ローカル環境のセットアップ**

    フォークしたリポジトリをクローンし、依存パッケージをインストールしてください。
    このプロジェクトでは [Bun](https://bun.sh/) を使います。

    ```bash
    git clone https://github.com/あなたのアカウント/runtechbook.git
    cd runtechbook
    bun install
    ```

     `bun run dev` でブラウザ上にプレビューを表示できます。また、実際の印刷状態を確認するには `bun run build` でPDFを出力します。


3. **原稿ファイルを追加する**

  - ブランチを切ります。(ブランチ名は任意で良いです)

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

 **その他、詳しい書き方**

## 提出方法
### 目次用にタイトルと著者名を追加
ご自身の.mdファイルの冒頭に以下を追記してください。
```
---
title: "記事のタイトル"
author: "midori"
---

```
これを`script/generate-toc.ts`で拾って目次を自動生成します。

### ビルドして出力を確認
 `$ bun run build` でPDF出力を行なってください。ここでエラーが出たり、レイアウトが崩れている場合は修正してください。目次にご自身の名前が載っているかもご確認ください。

### Pull Requestを作成

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

## 🧑‍💻 開発者向け補足情報

- 技術スタック：Bun + Vivliostyle.js + Markdown
- デザインテーマ：[@vivliostyle/theme-techbook](https://github.com/vivliostyle/themes/tree/main/packages/theme-techbook)
- 組版設定：`vivliostyle.config.js`
- 目次生成スクリプト：`script/generate-toc.ts`

---

## 🧾 FAQ（よくある質問）

**Q. Bun じゃなくて npm/yarn/pnpm じゃダメですか？**
A. npm/yarn/pnpm などでも良いです。その場合、package.jsonのスクリプトが Bun 前提のため、修正してお使いください。また、lockファイルをPRに含めないようご注意ください。

**Q. ローカルでの画像の挿入は可能ですか？**
A. 可能です。`images/` フォルダに配置し、Markdown 内で相対パスで参照してください。

**Q. 記事が途中でも PR していいですか？**
A. 大歓迎です！途中でも「草稿」として PR しておいてもらえると、編集調整や構成のご相談がしやすくなります。
