---
title: "DenoでLinuxコマンドを作ろう"
author: "れなっち"
---

# DenoでLinuxコマンドを作ろう

## はじめに
  れなっちと申します。
  Web系エンジニア歴2年目で、現在はクライアントサイドを中心にTypeScript系を使った開発をしています。
  好きなもの：アニメ・ねこ・ディズニー
  
### この記事で学べること
  - Linuxコマンドでのキャッチアップの仕方
  - Denoの初歩的な書き方
  
### 対象読者と前提知識
  Denoを触ってみたい人
  環境構築を手軽に済ませて、TypeScriptを少し書いてみたい方
  TypeScriptをキャッチアップしたい人


## 第1章: Denoの基礎

### 1.1 Denoとは - Node.jsとの違いを理解する
- **DenoとNode.js**
    Node.jsは現在の開発にはなくてはならない存在です。
    それだけ使用されているツールの反省点が10個もあること、そしてその反省点を活かしてDenoが開発されていることは根幹に関わる重要な背景です。これを認識して触ると、より理解が深まり面白いです。
  - TypeScript標準サポート
    コンパイルをしなくてもTypeScriptが実行できます。設定や追加の手順は一切不要なので、とっても簡単に扱うことができます。
    TypeScriptのキャッチアップに最適な環境と言えると思います。
  - Denoのpermissions
    Denoは、明示的に権限を与えない限り実行することができません。今回の実装内容は、ファイル作成や内容の上書きなど、かなり強力な操作を行います。そのため、コマンドの意味を理解して権限を与えることができる人しか実行できません。これは、さまざまな事故を未然に防ぐ役割があります。
    また、npmの脆弱性が増えてきているようです。その結果、サプライチェーン攻撃の標的になったりしています。Denoは、そのような攻撃に強くなっています。

   参考URL：https://www.youtube.com/watch?v=M3BM9TB-8yA

### 1.2 開発環境のセットアップ
- Denoのインストール
 公式こそ正義です。公式URLを参考に行ってください
 私はmiseで入れました。
 ご自身のお使いのバージョン管理ツールに合った方法をお使いください！

### 1.2 開発環境のセットアップ
- Denoのインストール
  公式こそ正義です。公式URLを参考に行ってください。
  私はmiseでインストールしました。
  ご自身のお使いのバージョン管理ツールに合った方法をお使いください！

### 1.3 catコマンドの作成
- 最初のコマンド作成
  1. まず、最初のコマンドとして、catコマンドを作成してみましょう！
  2. Unix cat のページ（https://docs.deno.com/examples/unix_cat/）にアクセスしてください。
  3. ブラウザに表示されているコードをコピーしてください。
  4. お好きなコードエディタで開いたDenoのリポジトリに`cat.ts`を作成して、先ほどコピーしてきたコードを貼り付けてください。
  5. これで完成です！
- 実行方法  
  ```
  % deno run cat.ts test.ts
  ```
  を実行してください。
  以下の文が出たと思います。

  ```
  % deno run cat.ts test.ts
    ┏ ⚠️  Deno requests read access to "test.ts".
    ┠─ Requested by `Deno.open()` API.
    ┠─ To see a stack trace for this prompt, set the DENO_TRACE
        _PERMISSIONS environmental variable.
    ┠─ Learn more at: https://docs.deno.com/go/--allow-read
    ┠─ Run again with --allow-read to bypass this prompt.
    ┗ Allow? [y/n/A] (y = yes, allow; n = no, deny; A = allow
         all read permissions) >
  ```
  ターミナルに「n」を入力してみましょう！

  ```
    % deno run cat.ts test.ts
      ❌ Denied read access to "test.ts".
      error: Uncaught (in promise) NotCapable: Requires read
       access to "test.ts", run again with the --allow-read flag
        const file = await Deno.open(filename);
                                ^
        at Object.open (ext:deno_fs/30_fs.js:541:21)
        at file:///Users/kashiwagirena/workspace/study/
        　LinuxCommand/cat.ts:6:29
  ```
  `Denied read access to "test.ts"`
  ↓日本語訳
  `「test.ts」への読み取りアクセスが拒否されました`
  読み取りができなかったようです。
  これは、Denoの特徴で、読み取り権限を与えないと読み取ることができないようになっています。

- 権限システムの理解
  上記エラーで、読み取り権限の許可を求めていることが分かります。
  これが「1.1 Denoのpermissions」で説明した内容です。
  許可を与えることでスクリプトが実行されます。
  デフォルトでは、ほとんどのシステムI/Oへのアクセスは拒否されます。
  ただし、ユーザーがDenoランタイムに明示的に権限を付与することでアクセスすることができます。
  許可には、下記表に記載しました。
  
  | オプション  | 許可内容       |
|-------------|---------------|
| --allow-read  | 読み込み許可  |
| --allow-write | 書き込み許可  |
| --allow-net   | ネットワークアクセスを許可 |
| --allow-env   | 環境変数の取得や設定などの環境アクセスを許可 |
| --allow-run   | サブプロセスの実行を許可  |
| --allow-all   | 全ての許可    |


--allow-allは、すべての権限を許可してしまうため、Denoのセキュリティ機能が無効化されてしまいます。そのため、おすすめできません。
必要な権限のみを与えてください。

- 再度実行
  今回のスクリプトは、`test.ts`ファイルの内容を読み込み、表示させるものです。
  `--allow-read`を追記してください。

  ```
  % Deno run --allow-read cat.ts test.ts

  @@@@@ FsFile {}
  for (const filename of Deno.args) {
      const file = await Deno.open(filename);
      console.log("@@@@@", file);
      await file.readable.pipeTo(Deno.stdout.writable,
       { preventClose: true });
  }%
  ```
  スクリプトが実行されました！
  ファイルの記述内容がターミナルに表示されました。

## 第2章: Linuxコマンドの実装 

### 2.1 ファイル操作コマンド `touch` の実装
  実際のコードはGitHubのURLを参考に確認してください。
  https://github.com/kashiwagi-rena/LinuxCommand/blob/main/touch.ts
- 超個人的なLinuxコマンドの調べ方
  ドキュメントを読むよりも実際に動かして挙動を確認した方が理解が深まると思い、コツコツ確認していきました。
  1. IBMの公式を確認。
  参考URL：https://www.ibm.com/docs/ja/aix/7.1.0?topic=t-touch-command
  2. 実行して、挙動の確認
  3. エラー文の確認と「自分がこのコマンドを使う時にどんなエラー文が出たら嬉しいか」を検討する。
  4. わかったことをコードにしていく。

- Denoの標準ライブラリについて
  touchコマンドを作成した際に、使用した標準関数を一覧にしました。
  標準関数が多く多機能なため、これらを把握しながら実装すると、開発がしやすいです。
    ```
  // スクリプトに渡されたコマンドライン引数（ファイル名以降）が配列に入る。
  Deno.args[];

  // パスで参照されるファイルシステムオブジェクトの
  // アクセス時刻（atime）と変更時刻（mtime）を変更します。
  Deno.utime();

  // ファイルが存在しない場合は作成し、既存のファイルは切り詰めます。
  // Deno.FsFile のインスタンスとして解決されます。
  Deno.create();

  // 指定されたパスのDeno.FileInfoに解決します。
  // シンボリックリンクは常に追跡します。
  Deno.stat();

  // オプションの終了コードでDenoプロセスを終了する。
  // 終了コードが指定されない場合、Denoはリターンコード0で終了します。
  Deno.exit();
  ```
参考：https://deno-ja.vercel.app/manual@v1.8.3/standard_library

### 2.2 自作コマンド cat_footsteps の実装
既存のLinuxコマンドだけ作っても楽しくないので、自作のスクリプトも作成してみました！
- 実装方法
実際のコードはGitHubのURLを参考に確認してください。
https://github.com/kashiwagi-rena/LinuxCommand/blob/main/cat_footsteps.ts

- 書いてあるコードの説明
**概要:** ターミナル全体を使って、猫のアスキーアートが左右に歩き、後ろに足跡が残って徐々に薄れて消えるアニメーションを表示します。

- 主要定数
ANSI: 画面クリア、カーソル移動/表示切替、色リセットや色指定（黄色・灰色・白）などのANSIエスケープコードを定義。
CAT_FRAMES: 猫のアスキーアート2フレーム（左足・右足）を配列で保持し、交互に切り替えて歩行表現。
FOOTPRINTS: 足跡として使うシンボルの候補（例: 🐾, ·, •）。

- 型定義
Position: x, y座標。
Footprint: Positionにsymbol（シンボル）とage（経過フレーム数）を加えた足跡の型。

- クラス CatWalkAnimation
フィールド: 画面のwidth/height、猫の位置catPos、現在のフレームframeIndex、足跡配列footprints、進行方向direction（1:右、-1:左）。

- ターミナル猫アニメ：位置制御、足跡寿命、描画処理の全体像
constructor(): Deno.consoleSize()からターミナルサイズを取得（なければ80x24にフォールバック）し、猫の初期位置を決定。
initScreen(): 画面クリアとカーソル非表示。
cleanup(): カーソル表示を戻して色をリセット。
updateCatPosition(): 猫のx位置を方向に応じて更新し、左右の端に近づいたらdirectionを反転。frameIndexを交互に更新して歩行アニメーション。
addFootprint(): 現在のフレーム（左足/右足）に応じて足跡の位置を決め、FOOTPRINTSからランダムにシンボルを選んでfootprintsに追加。要素が多くなり過ぎないよう古いものを間引き。
ageFootprints(): 各足跡のageをインクリメントし、一定フレーム（15）を超えた古い足跡を削除。
render(): 2次元バッファを作って、足跡と猫を色付きで描画。足跡は若いほど白、古くなると灰色で表現。最後にカーソルを左上へ戻し、バッファを画面へ出力。
start(): 無限ループで「位置更新→足跡追加→経年処理→描画」を実行し、120msスリープで約8FPSに。例外や中断時はcleanup()で後始末。

- エントリポイント
main(): SIGINT（Ctrl+C）で終了するシグナルハンドラを登録し、CatWalkAnimationを開始。
if (import.meta.main): スクリプトが直接実行されたときだけmain()を呼び、モジュールとしてインポートされた場合はアニメーションを開始しない構造。

- 実行方法
例: deno run cat_footsteps.ts
カーソルが非表示になり、猫と足跡のアニメーションが始まります。Ctrl+Cで安全に終了できます。

- 補足
足跡のシンボルはランダム選択され、古くなると色が薄く見えるように演出。
パフォーマンスのため、足跡配列のサイズを適度に抑制。ターミナルサイズが取得できない環境でもデフォルト値で動作します。

## 第3章: 品質向上
### 3.1 テスト
- 単体テストの書き方
目的: cat_footsteps.ts が import 時に副作用で main を実行しないことを保証します。console.log を差し替えて出力を捕捉し、ゼロであることを検証します。

参考URL：https://docs.deno.com/runtime/fundamentals/testing/

テスト本体:
```
import { assertEquals, assertStringIncludes } from "@std/assert";

Deno.test("cat_footsteps: import does not trigger main", async () => {
  const originalLog = console.log;
  const captured: string[] = [];
  console.log = (...args: unknown[]) => {
    captured.push(args.map(String).join(" "));
  };
  try {
    await import("./cat_footsteps.ts");
  } finally {
    console.log = originalLog;
  }
  assertEquals(captured.length, 0);
});
```
実行方法:

```
deno test
```

- Deno標準のテスト機能
無視フラグとサニタイズ制御: 統合スモーク（外部プロセス生成）を ignore: true で通常はスキップ。
sanitizeResources/sanitizeOps を無効化し、サブプロセス・ストリーム未解放での誤検出を防ぎます。
プロセス生成とシグナル: Deno.Command で cat_footsteps.ts を -A で起動し、短時間後に SIGINT を送って終了メッセージの一部を検証します。

```
// 実行例（無視設定）：サブプロセスで起動しSIGINTで終了させるスモークテスト
// 注意: 実行には `deno test --allow-run` 権限が必要で、
// TTY非依存では失敗する場合があります。
Deno.test({
  name: "cat_footsteps: integration smoke (spawn and SIGINT) [ignored]",
  ignore: true,
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async () => {
    const child = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "./cat_footsteps.ts",
      ],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const reader = child.stdout.getReader();
    const decoder = new TextDecoder();
    let output = "";

    const readLoop = (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) output += decoder.decode(value);
      }
    })();

    await new Promise((r) => setTimeout(r, 400));
    try {
      child.kill("SIGINT");
    } catch (_) {
      // ignore
    }
    await readLoop;
    assertStringIncludes(output, "猫の足跡アニメーション");
  },
});
```

## まとめ
  本記事では、DenoでLinuxコマンド風のツールを作る流れを、基礎から実装・テストまで一通り紹介しました。ポイントは次のとおりです。
  
  - Denoの概要と特徴
    TypeScriptを標準サポートし、デフォルト拒否のpermissionsモデルで安全に実行。必要最小限の権限（例: `--allow-read`）のみ付与するのが基本。
  - サンプルで学ぶpermissions
    `cat.ts`の実行を通じて、権限未付与だとI/Oが拒否されること、権限付与後に動作することを体験。
  - `touch`の実装で触れた主要API
    `Deno.args`, `Deno.utime`, `Deno.create`, `Deno.stat`, `Deno.exit` など標準APIで、実用的なファイル操作コマンドを実装。
  - ターミナルアニメ「cat_footsteps」
    ANSIエスケープで画面制御し、猫の歩行と足跡のフェードを描画。クラス設計とループ更新で分かりやすく拡張しやすい構造に。
  - テストと品質
    import時に副作用を起こさない単体テスト、`Deno.Command`を使ったスモークテストの考え方を紹介。
  
  まずは公式ドキュメントを起点に、小さく動かして振る舞いを観察し、必要な権限だけを与える—この流れで学ぶと、DenoとLinuxコマンドの両方を楽しくキャッチアップできます。

## 参考文献

- Deno公式：https://deno.com/
- Deno公式 日本語訳：https://deno-ja.vercel.app/
- IBMの公式：https://www.ibm.com/docs/ja/aix/7.1.0?topic=t-touch-command
- Node.jsに関する10の反省点 - Ryan Dahl - JSConf EU : https://www.youtube.com/watch?v=M3BM9TB-8yA