---
title: "AI時代にあえて学ぶターミナルの仕組み"
author: "midori"
---
# AI時代にあえて学ぶターミナルの仕組み
## 1. はじめに

私が初めてプログラミングに触れて驚いたことのひとつに、「ターミナル」の存在があります。
真っ黒な画面、文字だけの入力、カーソルの移動さえ難しい操作性。

「え、こんなの使うの？ほんとにコマンド打っていいの？」

GUI（グラフィカルユーザーインターフェース）[^1]しか使ったことのない私にとって、あの黒い画面に意味の分からない文字列を打ち込み、エンターを押す瞬間は毎回緊張する体験でした。
エンジニアとして働き始めた後も、Google Cloud Platform（GCP）やGitを操作するとき、経験豊富なエンジニアほどCLIを好んで使っています。ジュニアの私にとっては、操作対象が目に見えず、GUIのように直感的ではないCLIは、高度で難しいものに感じられ、CLIを使いこなすエンジニアは憧れの対象でもありました。(Vimerほんとかっこいい)

ところが近年、AIの普及によってCLIを補助するツールが続々と登場しています。自然言語で会話するだけで、ChatGPTやGitHub Copilotがコマンドを生成してくれたり、補完や自動化を助けてくれたりするようになりました。これにより、ターミナルは「コマンドを入力する黒い画面」から「AIと人間が協力して使う対話の場」へと進化しつつあります。結果として、ターミナルへの心理的なハードルもぐっと下がり、身近な存在になり始めています。

しかし、そこで立ち止まって考えたいのが「そもそもターミナルはどう動いているのか？」という基礎です。ターミナルは表面的にはシンプルですが、実は50年以上基本構造が変わっていないようです。その裏側はOSやシェルの仕組みと密接に関わっています。この仕組みを知ることは、AIのような新しい技術と付き合っていく上でも重要だと考えました。

本記事では以下を目指します：

1. **ターミナルの歴史を知る**
2. **ターミナルの仕組みを理解する**
3. **TypeScriptでシンプルな擬似実装を行い、ターミナルの仕組みを実際に確認する**

[^1]: グラフィカルユーザーインターフェースとは、マウスやアイコンなどを用いて直感的に操作できる仕組みのことです。

[^2]: インターフェースとは、人と機械が情報をやり取りする窓口のことです。ここでは「AIと人間が同じCLIを通じて対話する関係」を指しています。


## 2. ターミナルの歴史
そもそも、ターミナルとは何でしょうか。調べてみると、コンピューターの歴史的な変遷と共に「コンピュータと人をつなぐ入出力装置」として進化してきたことが分かりました。まずはその歴史を見ていきたいと思います。

### 2.1 パンチカードの時代

1950年代、コンピューターへのプログラム入力は「パンチカード」と呼ばれる厚紙に穴を開ける方法で行われていました。複数枚のカードを束ね、カードリーダーに通すと一度に処理が実行されます。

この時代のコンピューターは人間が即時に操作し、コンピューターが対話的に応答する仕組みは存在しませんでした。人間がカードを準備し、コンピューターが処理を行った後に、結果を後で紙に印刷するというサイクルで動いており、これは**バッチ処理**[^3]と呼ばれました。

![不明 - Library of Congress https://www.loc.gov/resource/mcc.023/?sp=8, パブリック・ドメイン, https://commons.wikimedia.org/w/index.php?curid=30538485による](https://storage.googleapis.com/zenn-user-upload/e4d0af2e88a9-20250908.jpg){style="width:70%;"}


[^3]: バッチ処理とは、複数の作業をまとめて一度に処理する方式のことです。リアルタイムな対話操作はなく、「結果は後でまとめて受け取る」という特徴があります。


### 2.2 テレタイプ端末（TTY）の登場

1960年代に入ると、タイプライターに似た**テレタイプ端末**（TTY: teletypewriter terminal）が登場します。ユーザーがキーを叩くと、その文字が電気信号としてコンピューターに送られ、結果が紙に印字されました。

これにより「入力してすぐに結果が返る」という体験が可能になり、現在のCLIの直接の祖先となりました。

1969年、AT&Tベル研究所でUNIXが誕生します。当時のUNIXはこのテレタイプ端末を使って操作されていました。画面に文字が映る時代ではなく、紙に印字される端末を前提としたOSだったのです。

![Rama & Musée Bolo - 投稿者自身による著作物, CC BY-SA 2.0 fr, https://commons.wikimedia.org/w/index.php?curid=36769046による](https://storage.googleapis.com/zenn-user-upload/6193c4725e5c-20250908.jpg){style="width:90%;"}


ここでUNIXは、従来のシステムが抱えていた課題に対して大胆な発想を導入します。


### UNIXの思想：「すべてをファイルとして扱う」
UNIXの大きな特徴のひとつが、「すべてをファイルとして扱う」 という設計思想です。

ここでいう「ファイル」とは、単にハードディスク上の文書や画像だけではありません。
キーボード、ディスプレイ、プリンタ、通信ポートといった 入出力装置までも「特別なファイル」 として表現されました。
端末も例外ではなく、`/dev/tty` というファイルを通じて利用されます。`dev`は`device`、`tty`は`teletypewriter`の略です。
プログラムは `/dev/tty` に書き込めば端末に文字が表示され、読み込めばユーザーのキー入力を得られる仕組みです。

この仕組みによって、プログラムは「相手が端末なのか、ファイルなのか」を意識する必要がなくなりました。すべてを同じインターフェースで扱えるというシンプルさは、UNIXの強みとなり、その後のターミナルの進化にも大きな影響を与えています。

### 2.3 ディスプレイ端末と制御コード
1970年代後半には、紙ではなくディスプレイに文字を映すビデオ端末が普及します。代表例が1978年登場の VT100 です。
VT100は制御コード（ANSIエスケープ）を導入し、アプリは文字列を出力するだけで端末がカーソル移動・色付け・画面消去を実行できるようになりました。
この仕組みは、現代の `ls --color` やプログレスバー表示にも通底しています。
![By Jason Scott - Flickr: IMG_9976, CC BY 2.0, https://commons.wikimedia.org/w/index.php?curid=29457452](https://storage.googleapis.com/zenn-user-upload/5f56c5387dcf-20250908.jpg){style="width:90%;"}

### 2.4 仮想端末（PTY）の誕生

当時、コンピュータの利用者全員に物理端末を配るのは高価で不便でした。そこで考えられたのが **擬似端末（Pseudo Terminal、PTY）** です。[^4]

擬似端末は「端末のふりをするソフトウェア」で、2つの窓口を持っています。

* **master側**：ターミナルアプリ（例: xterm, GNOME Terminal）がつながる
* **slave側**：シェルやプログラムがつながる

この仕組みは **電話の受話器** をイメージすると分かりやすいかもしれません。片方（master）に話しかけると、そのままもう片方（slave）に伝わり、返事も逆方向に届きます。

つまり：

1. ユーザーの入力は **master → slave** に渡る
2. プログラムの出力は **slave → master** を通って画面に返る

この「仮想的な受話器」があるおかげで、

* **ssh** で離れたコンピュータにログインできる
* **tmux** のように1つの画面を分割して複数の端末を持てる

といった柔軟な操作が可能になりました。


[^4]: 擬似端末（Pseudo Terminal, PTY）は、物理的な端末の動きをソフトウェアで再現したものです。 **Pseudo（スードゥ / ˈsuːdoʊ）** は「偽物の」「〜のふりをした」という意味の接頭辞です。したがって *Pseudo Terminal* は「実物の端末ではないが端末のように振る舞うもの」を指します。


### 余談：master と slave という言葉

擬似端末（PTY）の説明で **master** と **slave** という用語が登場しました。これは直訳すると「主人」と「奴隷」で、コンピュータ分野では長らく「主と従の関係」を表す専門用語として使われてきました。

たとえば：

* **master**：命令や制御を行う側
* **slave**：それに従って動作する側

ハードディスクのIDE接続方式や、クロック信号を配る電子回路などでも、この言葉は広く用いられてきました。

しかし現代において「slave」という言葉は歴史的に奴隷制度を連想させるため、技術の世界でも見直しが進んでいます。

代表的な例が **GitHub** です。かつて Git のデフォルトブランチ名は `master` でしたが、2020年以降 `main` に変更されました。これは機能上の理由ではなく、用語の持つ社会的な背景に配慮した判断です。

最近では、`primary/secondary` や `leader/follower` など、より中立的な表現を採用するプロジェクトも増えてきています。


### 2.5 X Window Systemとxtermの登場

1980年代半ば、MITライセンスで開発された **X Window System** がUNIXワークステーション[^5]に広まりました。
これは「画面上にウィンドウを表示し、複数のアプリを同時に操作できる」仕組みで、
その上で動作する代表的なターミナルエミュレータ[^6]が **xterm** です。

xtermは **VT100互換の制御コード** を解釈でき、従来の物理端末と同じように振る舞いました。
しかし、決定的に異なるのは **ソフトウェアとして動く** という点です。

これにより：

* 物理端末を1台ずつ用意する必要がなくなった
* 1台のコンピュータで複数のターミナルを同時に開ける
* GUI環境からも「黒い画面」にアクセスできる

といった利便性が一気に高まりました。

**xtermは現代のターミナルエミュレータの祖先**であり、
GNOME Terminal、Konsole、iTerm2 など、今も日常的に使われるソフトはすべてこの流れを受け継いでいます。

[^5]: 1980〜90年代に研究所や企業で使われていた「高性能なパソコン」のこと。OSにはUNIXを採用し、ネットワークやグラフィックス処理が得意だった。当時は数百万円する高価な機材で、研究・開発・3DCG制作など専門的な用途に使われた。現代ではLinuxサーバーやMacなどに役割が引き継がれている。

[^6]: エミュレータとは「ある仕組みを模倣して再現するソフトウェア」のことです。ターミナルエミュレータは、昔の物理端末を真似して動いています。


### 2章のまとめ：ターミナルは進化の積み重ね

ここまで、ターミナルの歴史を振り返ってきました。

![](https://storage.googleapis.com/zenn-user-upload/cdeba004f9ea-20250926.png)


こうして見ると、ターミナルは単なる「黒い画面」ではなく、**コンピューターの進化の積み重ねが形になったもの**だと分かります。
それでは、端末からの入力をした文字列はどうやって解釈されるのでしょうか。また、どのように実行され、結果が返るのでしょうか。その仕組みをさらに見ていきたいと思います。

## 3. ターミナルの仕組み

ターミナルは「入力と出力の窓口」として進化してきました。本章ではその仕組みを **５つの要素** に分けて整理していきます。

1. **シェル**（コマンド解釈と実行の司令塔）
2. **入出力の3本柱（stdin / stdout / stderr）**（データの入口・出口）
3. **プロセス（fork/exec）**（実行主体の増殖と置換）
4. **制御コード（ANSIエスケープ）**（画面操作の指示）
5. **シグナル**（割り込みと制御）

### 3.1 シェル

ターミナルについて考える上で、忘れてはいけない存在が **シェル** です。
シェルは、**ユーザーが入力した文字列を解釈し、OSに命令を伝える役割を担うプログラム**です。

仕組みを整理すると、シェルはとてもシンプルなループを回しています。

1. **ユーザーの入力を読む**（標準入力）
2. **コマンドとして解釈する**（`ls` ならファイル一覧表示、`echo` なら文字出力など）
3. **新しいプロセス\[^7]を作って実行する**（OSの `fork` と `exec` に相当）
4. **結果を表示する**（標準出力に書き込む → 端末に表示される）

この一連の流れを、シェルは延々と繰り返しています。これは「Read-Eval-Print-Loop（REPL）」と呼ばれ、

* **Read**（入力を読む）
* **Eval**（解釈・実行する）
* **Print**（結果を出す）
* **Loop**（繰り返す）
  というサイクルです。

たとえば、あなたが `ls` と入力すると、シェルは以下のように動きます：

1. `ls` という文字列を受け取る
2. それを「外部コマンド」と解釈する
3. 子プロセスを作って `/bin/ls` を実行する
4. その出力（ファイル一覧）を端末に返す
5. 終わったらまた新しい入力を待つ

このシンプルな繰り返しこそが、「打つ → 実行される → 結果が返る」というターミナルのサイクルの正体です。

では、このシェルがやり取りする「入力」や「出力」は、どのように扱われているのでしょうか。ここで重要になるのが、入出力を支える 3本柱 です。


[^7]: プロセスとは「実行中のプログラム」のことです。シェルは新しいプロセスを作ってコマンドを実行し、終わるのを待ちます。

### 3.2 入出力の3本柱：標準入力・標準出力・標準エラー出力

ターミナルで動くプログラムは、基本的に3本のパイプを持っています。

* **標準入力（stdin）**：キーボードからの入力が流れてくる
* **標準出力（stdout）**：実行結果が流れていく
* **標準エラー出力（stderr）**：エラーメッセージが流れていく

これら3本の流れはすべて **ファイルディスクリプタ** としてOSに管理されています。
ファイルディスクリプタとは「プログラムがOSに渡される抽象的なハンドル(番号札)」で、番号 0, 1, 2 がそれぞれ標準入力・標準出力・標準エラー出力に対応しています。

たとえば `ls` コマンドを打つと、
キーボードで入力した「ls」が **標準入力(0)** に流れ、
プログラムが処理して得た「ファイル一覧」という結果が **標準出力(1)** に流れ、
もし「そんなディレクトリはない」といった失敗があれば **標準エラー出力(2)** に流してきます。

![](https://storage.googleapis.com/zenn-user-upload/84825112e21b-20250926.png)


### 3.3 プロセスとフォーク

ターミナルに入力されたコマンドは、シェルによって「新しいプロセス」として実行されます。
仕組みをざっくり言うと：

1. シェルが `fork()` して子プロセスを作る
2. 子プロセスが `exec()` で実行ファイル（例：`/bin/ls`）に置き換わる
3. そのプロセスの入出力は `/dev/tty` を通じてターミナルと繋がる

親であるシェルは「子プロセスが終わるのを待つ」役割を担います。このしくみのおかげで、複数のコマンドを直列・並列に組み合わせられるのです。


### 3.4 制御コードと画面描画

こうして実行されるプロセスは、結果をただ文字として返すだけではありません。文字色の変更やカーソル移動といった 画面操作 も、文字の一種としてやり取りされています。プログラムはこれらを文字列として出力するだけですが、ターミナル側が**制御コード**を理解して画面を操作します。代表例が ANSIエスケープシーケンス です。

例えば：

* `\x1b[31m` → 文字色を赤にする
* `\x1b[2J` → 画面をクリアする
* `\x1b[H` → カーソルを左上に移動する

つまり、`ls --color`でファイルの種類別に色を付けて表示したり、ライブラリのインストール時に出力されるプログレスバーは、裏ではただの制御文字の羅列にすぎないのです。


### 3.5 シグナルと割り込み
ターミナルでの操作は表示だけではありません。実行中のプログラムを止めたり終了させたりする「操作の信号」も存在します。それが **シグナル** です。
これはOSからプロセスへの通知の仕組みで、ターミナルはユーザーの操作をシグナルとして送ります。

* `Ctrl+C` → `SIGINT`（割り込み。通常はプロセス終了）
* `Ctrl+Z` → `SIGTSTP`（一時停止）
* `Ctrl+D` → EOF（入力の終わり）

この仕組みにより、ユーザーは実行中のプログラムを制御できるようになっています。

#### OSが裏でやっていること

前章でも述べたとおり、UNIX では **キーボードや画面も「ファイルの一種」として扱われます**。 
たとえば端末は `/dev/tty` という特殊ファイルを通じて表されており、プログラムからすると

* 「ファイルに文字を書き込む」＝ 画面に表示される
* 「ファイルから読み込む」＝ キー入力が得られる

というふうに見えます。

プログラムは単に `read(fd, …)` や `write(fd, …)` といった **共通の入口（システムコール）** を呼び出すだけです。
OSは「そのファイルディスクリプタがどの対象につながっているか」を調べ、もし通常ファイルならディスクI/O[^8]を行い、`/dev/tty` なら端末ドライバ[^9]を呼び出し、ソケット[^10]ならネットワークスタックを通す、というふうに **相手の正体に応じて処理を切り替えます**。

プログラムは「端末用の特別な関数」を覚える必要がなく、**文書ファイルを読むのも、キーボード入力を読むのも同じread/writeで済む**のです。


たとえば次のように書くと

```bash
ls > result.txt
```

これは「標準出力(1)の行き先を画面（/dev/tty）ではなく result.txt に差し替える」ことを意味します。
結果として `ls` の出力は画面に表示されず、ファイル `result.txt` に保存されます。

このように、**コマンドは入力と出力の流れを受け渡す『入れ物』** として振る舞います。

[^8]: I/O とは 入出力（Input/Output）のこと。
[^9]: コンピューターに接続して利用されるマウスやキーボード、プリンターなどのデバイスをOSが操作できるようにするソフトウェアのこと。
[^10]: ネットワーク上の相手とデータをやり取りするための「仮想的な通信口」。プログラムはソケットを通じて他のコンピュータとデータを送受信でき、OSはソケットの種類（TCP、UDPなど）や接続先に応じて、ネットワークスタックを介して適切にデータを処理する。


### 3章のまとめ：黒い画面の正体

ターミナルは「ただの黒い画面」ではなく、

* **入出力の流れ**（stdin, stdout, stderr）
* **プロセスの生成と管理**（fork/exec）
* **画面制御のための文字列**（ANSIエスケープシーケンス）
* **ユーザー操作を伝える仕組み**（シグナル）

といった複数の要素が噛み合って動く「入出力と制御のハブ」だと分かります。

![](https://storage.googleapis.com/zenn-user-upload/0ec4c6d579df-20250930.png)

次章では、この仕組みを実感するために **TypeScriptで簡単な擬似ターミナルを実装** してみましょう。実際にコードを書いてみると、これまで抽象的だった概念が一気に身近に感じられるはずです。


## 4. TypeScriptで作るミニターミナル

### 4.1 目標（できること）

* 「端末 ↔ シェル ↔ コマンド」の**通り道**を、最小実装で体験する
* 入力（stdin）→ 解釈（shell）→ 出力（stdout）の**REPL**を自作する
* ほんの少しの**内蔵コマンド**（`echo`, `date`, `sleep`, `wc`, `help`, `exit`）を動かす
* 疑似端末（PTY）っぽい**master/slave**の流れを**メモリ上のパイプ**で再現する


### 4.2 実装


|     | 要素名                  | これは何？                      | コード上の実体                                                     | 何の代わり？（狙い）                                           |
| ------ | -------------------- | -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| **1** | **PtyPair**          | 入出力の**配線アダプタ**（人↔シェルの往復）   | `class PtyPair { masterIn/masterOut/slaveIn/slaveOut }`     | 本物の **Pseudo TTY(PTY)** の簡易再現（`PassThrough`でメモリ内パイプ） |
| **2** | **Shell**            | **REPL 本体**（1行読む→解釈→実行→表示） | `class MiniShell { run(); tokenize(); }`                    | **bash/zsh** の最小版（まずは行単位でディスパッチのみ）                   |
| **3** | **Builtin Commands** | コマンドの**実体関数の棚**            | `const commands: Record<string, Cmd> = { echo, date, ... }` | 本来の `/bin/*` など外部コマンドの**置き換え**（まずは関数で体験）             |
| **4** | **Terminal**         | 人間の**入口/出口**（現実I/Oと配線を接続）  | `main()` 内の配線（`stdin`→`masterIn`, `masterOut`→`stdout`）     | OSの **/dev/tty** / 端末アプリの**橋渡し**                     |

![](https://storage.googleapis.com/zenn-user-upload/b7acf68b8e1b-20250930.png)


```ts
// mini-terminal.ts
// Node.js v18+ / TypeScript 5+
// tsc && node dist/mini-terminal.js で実行

import { PassThrough, Readable, Writable } from "node:stream";
import * as readline from "node:readline/promises";
import { setTimeout as sleepMs } from "node:timers/promises";

// -----------------------------
// 1) 擬似端末 (PTY) ペア
//   - master*: 人間(端末)側
//   - slave*:  シェル側
//   2方向のデータ流れを PassThrough で再現します
// -----------------------------
class PtyPair {
  // Terminal → masterIn → (pipe) → slaveIn → Shell
  masterIn = new PassThrough();
  // Shell → slaveOut → (pipe) → masterOut → Terminal
  masterOut = new PassThrough();
  slaveIn = new PassThrough();
  slaveOut = new PassThrough();

  constructor() {
    // master→slave
    this.masterIn.pipe(this.slaveIn);
    // slave→master
    this.slaveOut.pipe(this.masterOut);
  }
}

// -----------------------------
// ユーティリティ（トークン化）
//  - クォート対応の軽量パーサ（超簡易）
//  - 空白で区切るが、' ' や " " で囲まれた空白は1つの単語として扱う
//  - 例: tokenize(`echo "hello world"`) → ["echo","hello world"]
//  - 厳密なシェル構文ではなく最小仕様
// -----------------------------
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        cur += ch;
      }
    } else {
      if (ch === "'" || ch === '"') {
        quote = ch as "'" | '"';
      } else if (/\s/.test(ch)) {
        if (cur) {
          tokens.push(cur);
          cur = "";
        }
      } else {
        cur += ch;
      }
    }
  }
  if (quote) {
    // 片方閉じ忘れはそのまま
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// -----------------------------
// 3) Builtin Commands
//   - ここに {名前: 関数} を追加すると、新しいコマンドが増える
//   - Cmd は「引数と入出力インターフェースを受け、終了コードを返す」関数
// -----------------------------
type IO = {
  stdin: Readable;  // コマンドの標準入力（今は空。将来パイプ実装で活きる）
  stdout: Writable;  // コマンドの標準出力
  stderr: Writable;  // コマンドの標準エラー出力
  prompt: () => void; // プロンプト再表示用のコールバック（必要時に呼ぶ）
};
type Cmd = (args: string[], io: IO) => Promise<number> | number;

const commands: Record<string, Cmd> = {
  help: async (_args, io) => {
    io.stdout.write(
      [
        "Builtins:",
        "  help          このヘルプを表示",
        "  echo [args]   そのまま出力",
        "  date          現在時刻を表示",
        "  sleep <ms>    指定ミリ秒だけ待機",
        "  wc            入力の行/単語/文字数をカウント",
        "  exit          シェルを終了",
        "",
        "Tips: パイプやリダイレクトは未対応（最小実装）",
      ].join("\n") + "\n"
    );
    return 0; // 終了コード0 = 成功
  },

  echo: async (args, io) => {
    io.stdout.write(args.join(" ") + "\n");
    return 0;
  },

  date: async (_args, io) => {
    io.stdout.write(new Date().toISOString() + "\n");
    return 0;
  },

  sleep: async (args, _io) => {
    const n = Number(args[0] ?? "0");
    if (!Number.isFinite(n) || n < 0) return 1;
    await sleepMs(n);
    return 0;
  },

  wc: async (_args, io) => {
    // 標準入力をまるっと読む（簡易版）
    const chunks: Buffer[] = [];
    for await (const c of io.stdin) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c)));
    const text = Buffer.concat(chunks).toString("utf8");
    const lines = text.split(/\r?\n/).filter(() => true).length;
    const words = (text.trim() ? text.trim().split(/\s+/) : []).length;
    const chars = [...text].length;
    io.stdout.write(`${lines} ${words} ${chars}\n`);
    return 0;
  },

  exit: async () => {
    // 終了コード0で抜ける
    process.exit(0);
  },
};

// -----------------------------
// 2) シェル（REPL）
//   - 1行読み取って → tokenize → commands から関数を引き当てて実行
//   - 未定義コマンドはエラーメッセージを出して次のプロンプトへ
// -----------------------------
class MiniShell {
  private rl: readline.Interface;

  constructor(
    private slaveIn: Readable,   // シェルが読む（人間から来る）入力
    private slaveOut: Writable,  // シェルが書く（人間へ返す）出力
    private slaveErr: Writable   // エラー表示用
  ) {
    this.rl = readline.createInterface({
      input: this.slaveIn,
      output: this.slaveOut,
      terminal: false, // ここはTTYではなく純ストリーム
      prompt: "",
    });
  }

  prompt() {
    this.slaveOut.write("> ");
  }

  // メインループ：1行ずつ処理
  async run() {
    this.prompt();
    for await (const line of this.rl) {
      const trimmed = line.trim();
      if (!trimmed) {
        // 空行は何もしないで次のプロンプト
        this.prompt();
        continue;
      }

      const [cmd, ...args] = tokenize(trimmed);
      const impl = commands[cmd];

      if (!impl) {
        // 未知コマンド
        this.slaveErr.write(`command not found: ${cmd}\n`);
        this.prompt();
        continue;
      }

      // 各コマンドにIOを渡す（ここでは stdin を毎回空のReadableに）
      const stdin = new PassThrough();
      // 行単位REPLなので、ここでは追加入力は無し（パイプ未対応の最小形）
      stdin.end();

      try {
        // コマンドを実行
        await impl(args, {
          stdin,
          stdout: this.slaveOut,
          stderr: this.slaveErr,
          prompt: () => this.prompt(),
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // コマンドの実行時エラーを握りつぶさず通知
        this.slaveErr.write(`error: ${msg}\n`);
      }
      this.prompt();
    }
  }
}

// -----------------------------
// 4) Terminal（人間側の出入口）
//   - キーボード入力を masterIn に流し、Shell の出力を stdout に表示
//   - Ctrl+C は「いまの行を諦めて次のプロンプトへ」という簡易挙動
// -----------------------------
async function main() {
  const pty = new PtyPair();

  // Keyboard(人間) → masterIn
  // Ctrl+C を「行のキャンセル」として扱う
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.on("data", (buf) => {
    // ^C (0x03)
    if (buf.length === 1 && buf[0] === 0x03) {
      // 行をリセットして改行＋プロンプトだけ出す
      pty.masterOut.write("^C\n");
      // Shell 側に「空行」を送って次のプロンプトへ
      pty.masterIn.write("\n");
      return;
    }
    pty.masterIn.write(buf);
  });

  // masterOut → Display(人間)
  pty.masterOut.pipe(process.stdout);

  // Shell を slave 側にぶら下げる
  const shell = new MiniShell(pty.slaveIn, pty.slaveOut, pty.slaveOut);
  shell.run().catch((e) => {
    console.error("Shell error:", e);
    process.exit(1);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

---

### 4.3 動かし方

1. TypeScriptセットアップ（未導入なら）

```bash
npm init -y
npm i -D tsx
# エディタで型補完が欲しければ（任意）
npm i -D @types/node
```

2. 上記コードを `mini-terminal.ts` に保存し実行

```bash
npx tsx mini-terminal.ts
```

3. 試すコマンド例

```
> help
> echo "hello world"
> date
> sleep 500
> wc   # 何も流していないので 1 0 0 等の最小値に
> exit
```

> これは、最小実装なので **パイプ（`|`）やリダイレクト（`>`）** は未対応です。

文字数と締め切りにより、ここではどのような挙動をするかあえて解説しません()
もし良ければ、ぜひ試してみてください。


### 4.4 まとめ
この実装からも、ターミナルは「入力と出力を結ぶ通話路」であり、シェルはその入力を解釈してプログラムへ渡す受付係として機能します。そして、Ctrl+C のような割り込みも、本質的には「特別な文字列を入力ストリームに流す仕組み」として説明できます。


### 5. 最後に
今回この記事を書いたことで、黒い画面の奥深さを感じることができました。（もう怖くないぞ！）
とりわけ強く実感したのは、「シンプルであること」の凄さです。コンピュータやOSには流行り廃りがありますが、その中でターミナルは何十年も利用され続けてきました。そしてAI時代を迎えた今でも、その存在はむしろ再評価され、最盛を迎えています。

これは、ターミナルが複雑な機能を詰め込んだからではありません。むしろ逆で、「文字をやり取りする」「全てをファイルとみなす」という最小限の仕組みに徹しているからこそ、どんな時代の技術とも接続でき、使い続けられるのです。
シンプルであることは一見地味ですが、それこそが長く生き残る力を持ち、普遍性を与えるのだと感じました。今後エンジニアとして、このような普遍性があり長く愛されるサービスを作る上でも大事にしたいなと思いました。
「黒い画面が怖い」あなたに、この記事を通して共感してもらえたら幸いです。

### 参考文献
Gregory Anders, “State of the Terminal,” g.p. anders blog, March 12, 2024.
URL: https://gpanders.com/blog/state-of-the-terminal/
 (参照日：2025年10月)

 Linus Åkesson, “The TTY demystified,” linusakesson.net – Programming，History セクションほか．
URL: https://www.linusakesson.net/programming/tty/
 (参照日：2025年10月)

 LPI Learning Materials, “103.4_01: Input, Output, Storage,” LPI Learning Portal.
URL: https://learning.lpi.org/en/learning-materials/101-500/103/103.4/103.4_01/
 (参照日：2025年10月)

 武内 覚, 試して理解 Linux のしくみ — 実験と図解で学ぶ OS、仮想マシン、コンテナの基礎知識【増補改訂版】, 技術評論社, 2022年10月刊行
 https://amzn.asia/d/ceU9Fjn

R. Koucha, “PTY / Pseudo-Terminal (PTY, PDIP) — Redirection of Standard Input and Outputs of a Process,” Tech Corner.
URL: https://www.rkoucha.fr/tech_corner/pty_pdip.html
 (参照日：2025年10月)