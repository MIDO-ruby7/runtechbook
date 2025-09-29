---
title: k 近傍法でレモンサワーを探せ
author: 'ゆーか'
---

# k 近傍法でレモンサワーを探せ

## はじめに

**「レモンサワーに似た飲み物は何だろう？」**

居酒屋でレモンサワーを頼んで飲むと...ん？レモンサワー？いや、何か別の飲み物に似ているような...。
居酒屋飲み放題あるある、「これお酒入ってる？」「レモンの味...する？」...というありふれた日常から生まれたこの疑問を、機械学習を使って解決してみました。

とはいえ私の機械学習の知識はほぼゼロのレベルです。毎週実施している輪読会で **k 近傍法**を知り、レコメンド機能ってこういうアルゴリズムからできるんだ！と興味を持ち今回の実装に挑戦してみました。エンジニアが集まるとつい、「どれ頼んだらレモンサワーの味するドリンクくるのかな？」と**デバッグ感覚で飲み比べを始めてしまう。**そんなくだらないからこそ楽しい記憶をふと思い出し、k 近傍法で検索してみることにしました。

### 自己紹介

1996 年、愛知県生まれの元薬剤師。2024 年 12 月よりエンジニア転職し、現在は Java メイン。プログラミングスクールで Ruby、実務で PHP を経験し、言語にこだわらず課題解決の手段として積極的に学習中です。
趣味は読書と愛犬の柴犬と戯れること、バドミントンなどなど。

### ゴール

Ruby 学習者の視点から**「くだらない疑問を真面目に解決する」**姿勢で筆者のレベルで、下記を比較・考察します。

- 両言語の処理速度や実装の違い
- その結果「レモンサワーに似た飲み物」は何になるのか

※検索に使用したデータはダミーデータのため検索結果はあくまで参考です。

### なぜこの比較をしたのか

機械学習というと Python のイメージが強いですが、Ruby にも **Annoy ライブラリ**などが存在することを知りました。
しかし Python と比較すると Ruby は機械学習に関する情報が少ない印象もあり、実際の性能や開発体験はどうなのか疑問でした。
また、単純な技術比較ではなく、この技術を使ってどのように課題を解決できるのかという観点も含めて検証したいと考えました。

### データの構造

**ドリンクの基本情報**
drink_id,name,category,abv,ingredients

- category: sour, cocktail, coffee, beer 等
- abv: アルコール度数
- ingredients: 材料（ベクトル化対象）

## 1. 開発効率の比較

まずは開発にかかった時間とコード行数を比較し考察します。

**開発時間の内訳比較**

<table style="width: 75%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">工程</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python（40 行）</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby（120 行）</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">差（倍）</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">環境構築</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">30 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">30 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1.0 倍</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">データ前処理</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">60 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">60 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1.0 倍</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">アルゴリズム実装</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">120 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">240 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">2.0 倍</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">テスト・デバッグ</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">60 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">60 分</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1.0 倍</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>合計</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>270 分</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>390 分</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>1.4 倍</strong></td>
    </tr>
  </tbody>
</table>

**【Python：ライブラリの豊富さが開発を加速】**

**scikit-learn** の使用でドキュメントも破りやすく、わずか数行で高性能な類似度検索を実現できました。

**【Ruby：開発効率の高さでストレスのない実装】**

Annoy は Python と同様にライブラリを使用しましたが、それ以外は python の実装を参考に精度を少し落とし、自前実装したためコード量は増えましたが Ruby の豊富な標準メソッドやメソッドチェーンにより、実装はストレスなく進められました。

## 2. 実際の実装を紹介

ドリンクの材料をベクトル化し、k 近傍法による検索を実装していきます。Python と Ruby 共に C 言語で作成された Annoy を使用し、Python では scikit-learn、Ruby では自前実装でベクトル化とコサイン類似度計算を行いました。

### ベクトル化

まずは比較対象となるドリンクの材料を比較できるようにベクトル化していきます。

**【Python（scikit-learn）】**

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(min_df=1, max_df=0.7, analyzer='char', ngram_range=(2, 4))
tfidf_matrix = vectorizer.fit_transform(ingredients_texts)
```

ライブラリがあるため基本的に ** TfidfVectorizer クラス** のドキュメントを参考に実装しました。ただし、sklearn（パッケージ名: scikit-learn） は非常に大きなライブラリであったため使用するクラスのみインポートして使用しました。

**文字レベルの N-gram の採用理由：**
`peach_juice`と`peach_liqueur`のように、異なる単語でも共通の文字列（`peach`）を持つ場合の類似性を考慮できるよう採用

**【Ruby(単語頻度ベクトルを自前実装)】**

```ruby
def vectorize_drinks(drinks_data)
  all_ingredients = drinks_data.flat_map { |drink| drink['ingredients'] }.uniq

  drink_vectors = {}
  drinks_data.each do |drink|
    # vector: 材料が使われた回数をcount
    vector = all_ingredients.map { |ingredient| drink['ingredients'].count(ingredient) }
    # drink_vectors: ハッシュにベクトル（出現回数）を蓄積
    drink_vectors[drink['drink_id']] = {
      name: drink['name'],
      category: drink['category'],
      vector: vector
    }
  end

  drink_vectors
end
```

Python では **TF-IDF** というベクトル化手法を使用しましたが、 Ruby には同様のものがなく自前実装は厳しいと判断したため**単語頻度ベクトル**によるベクトル化を実装しました。
選定理由は比較的小規模で構造化されたデータを扱っているため（ドリンクの材料）、TF-IDF のように単語の重みを下げ精度を上げる手法を実装せず十分な結果が得られると考えました。

**使用した Ruby の標準メソッド抜粋**

- `flat_map` - 配列の各要素にブロックを適用し、結果を平坦化した新しい配列（全ての材料が格納）を作成

**【補足：TF-IDF と単語頻度ベクトル】**
TF-IDF や単語頻度ベクトルは単語や文章をベクトル化するための手法です。TF-IDF は単語の重みを下げるため同義語や類似概念が増えてくるとより効果を発揮します。
例えば下記の 4 つのドリンクがある場合...

- ユーザー A/桃ジュース（ピーチ果汁）
- ユーザー B/ピーチウーロン（ピーチリキュール）
- ユーザー C/ピーチオレンジ（ピーチリキュール）
- ユーザー D/ピーチソーダ（ピーチリキュール）

**単語頻度ベクトルではユーザー A のみマッチングされない可能性が発生します。**
なぜかというと単語頻度ベクトルの場合、「ピーチリキュール」と「ピーチ果実」の関連は認識がなく、類似度が低くなるからです。
一方 TF-IDF では、「ピーチ」に対して単語の重みを高くするため類似度が大幅に向上し、マッチングされやすくなります。

### コサイン類似度計算

続いてベクトル化した材料の類似度を計算できるようにしていきます。

**【Python（cosine_similarity）】**

```python
from sklearn.metrics.pairwise import cosine_similarity

# ベクトル化した行列(tfidf_matrix)の全てのベクトル同士の類似度を計算
similarities = cosine_similarity(tfidf_matrix)
```

こちらも基本的にドキュメントを参考に実装しました。

<div class="page-break"></div>

**【Ruby（自前実装）】**

```ruby
def cosine_similarity(vec1, vec2)
  # 内積を計算
  dot_product = vec1.zip(vec2).map { |a, b| a * b }.sum
  # ベクトルの大きさを計算
  magnitude1 = Math.sqrt(vec1.map { |x| x**2 }.sum)
  magnitude2 = Math.sqrt(vec2.map { |x| x**2 }.sum)

  # 材料データの不足時に安全策として0.0を返し処理を終了する
  return 0.0 if magnitude1 == 0 || magnitude2 == 0
  # コサイン類似度を計算
  dot_product / (magnitude1 * magnitude2)
end
```

Python には `cosine_similarity` がありましたが ruby には同様のものはなく、標準ライブラリ・メソッドを使用して自前実装しました。

**使用した Ruby の標準ライブラリ・メソッド抜粋**

- `zip` - コサイン類似度計算で内積を求める必要があるため、要素ごと 1 つずつにペアとする
  例としては、下記のように使用している。
  ```
  vec1 = [1, 2, 3]
  vec2 = [4, 5, 6]
  vec1.zip(vec2) # => [[1, 4], [2, 5], [3, 6]]
  ```
- `Math.sqrt` - 平方根に変換する

**【補足：コサイン類似度の数式】**
`コサイン類似度 = (A・B) / (|A| × |B|)`
-1~1 の範囲で **1 に近いほど類似**していると言えます。

### k 近傍法による検索

最後に Annoy を使用して検索の実装をしていきます。

**【Python（Annoy）】**

```python
from annoy import AnnoyIndex

# vector_dim: ベクトルの次元数
vector_dim = tfidf_matrix.shape[1]
# 1.インデックス作成
index = AnnoyIndex(vector_dim, 'angular')
```

<div class="page-break"></div>

```python
# 2.ベクトル追加
for i in range(tfidf_matrix.shape[0]):
    # Annoyライブラリを使用するため１次元に変換
    vector = tfidf_matrix[i].toarray().flatten()
    index.add_item(i, vector)
# 3.インデックス構築（検索可能な状態になる）
index.build(n_trees=10)
```

Annoy ライブラリを使用したためドキュメントを参考に実装しました。
検索までの流れは、**1.インデックス作成 2. ベクトル追加 3. インデックス構築**です。

**使用した Python の標準ライブラリ抜粋**

- `shape` - sklearn の内部で使用されている行列オブジェクトで配列や行列の次元を取得する役割があります
  例として、下記のように使用しています。
  ```
  arr = np.array([[1, 2, 3], [4, 5, 6]])
  print(arr.shape)  # (2, 3) - 2行3列
  ```

**【Ruby（Annoy）】**

```ruby
def annoy_search(drink_vectors)
  vector_dim = drink_vectors.values.first[:vector].length
  index = Annoy::AnnoyIndex.new(n_features: vector_dim, metric: 'angular')

  drink_ids = drink_vectors.keys
  drink_ids.each_with_index do |drink_id, i|
    vector = drink_vectors[drink_id][:vector]
    index.add_item(i, vector)
  end

  index.build(10)
end
```

Python では sklearn を使用しデータ構造が２次元の行列となっているため、行：飲み物、列：材料の TF-IDF 値となっている。
Ruby ではデータ構造がハッシュ形式となっているため、配列（[:vector]）の長さが次元数となる。

**【補足：build メソッドについて】**

Annoy ライブラリの近似最近傍探索インデックス構築処理をする。build 後に検索が可能となります。

## 3. 実行結果で比較

### 処理速度

Python と Ruby で一部実装内容は異なりますが、処理速度を比較しました。
比較内容としてデータ量は 3 パターン（10, 100, 1000 件）、処理範囲は 4 パターン
（ベクトル化完了時間、類似度計算完了時間、Annoy 検索完了時間、総処理時間）で実施しました。

**データ量による性能の変化**

<table style="width: 75%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">データ量</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">性能比</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">10件</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.001474 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000888 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby が1.66 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">100件</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.001888 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.048502 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が25.7 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1,000件</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.007339 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">5.073059 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が691.2 倍高速</td>
    </tr>
  </tbody>
</table>

10 件では Ruby が 1.66 倍、100 件以上では Python が圧倒的に高速という結果でした。
Ruby が高速となった理由について、データ数 10 件と 100 件の場合の結果をさらに深掘り考察していきます。

**【データ量 10 件で実施した結果】**

<table style="width: 80%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">処理項目</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 時間</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 時間</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">性能比</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">ベクトル化</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.001191 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000054 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby が22.1 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">類似度計算</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000278 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000778 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が2.8 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Annoy 検索</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000005 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000056 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が11.2 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>総処理時間</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>0.001474 秒</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>0.000888 秒</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>Ruby が1.66 倍高速</strong></td>
    </tr>
  </tbody>
</table>

**小規模データ（10 件）ではなぜ Ruby が高速だったのか**

- ベクトル化の処理を精度を下げて単純な自前実装にしている
- ただし、類似度計算や検索は Python の最適化ライブラリが優位
- 今回の小規模データでは「ライブラリ初期化の重さ」より「シンプル実装の軽さ」が勝った

**【データ量 100 件で実施した結果】**

<table style="width: 80%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">処理項目</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 時間</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 時間</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">性能比</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">ベクトル化</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.002173 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000314 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby が6.9 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">類似度計算</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000405 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.050983 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が125.9 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Annoy 検索</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000010 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.000563 秒</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python が56.3 倍高速</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>総処理時間</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>0.001888 秒</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>0.048502 秒</strong></td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;"><strong>Python が25.7 倍高速</strong></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

**なぜ Python が高速になったのか**

- ベクトル化のみ Ruby が有利だが、小規模データでは 22.1 倍高速であったのに対して 6.9 倍まで落ちており、それ以外の処理項目はは Python が圧倒的
- scikit-learn や NumPy による 並列化・メモリ最適化・C 実装 の効果が大きい
- 小規模データではライブラリの起動時間が不要な分、手作り実装が有利だが、100件以上の大規模データでは最適化されたライブラリが圧倒的に有利。

## 4. 結果「レモンサワーに似た飲み物は何だろう？」

さて、ここまで実装方法やその速度についてみてきました。いよいよ最後にレモンサワーに似た飲み物についてみていきます。
比較する飲み物を 5 個用意し、レモンサワーに似た飲み物を検索していきます。

### レモンサワーに似た飲み物の検索結果

結論としては**「レモンサワーに似た飲み物はハイボールレモン」**となりました。
2 位のレモンモヒート（Python: 0.4814、Ruby: 0.5164）もレモン系の飲み物ですが、炭酸がない点でレモンサワーとの類似度が下がっていると考えられます。さらに 3 位のレモンジュース（Python: 0.3485、Ruby: 0.3333）はアルコールが含まれていないため、さらに類似度が低くなったと考えました。

この結果から、Annoy ライブラリは飲み物の特徴（アルコールの有無、炭酸の有無、フレーバーなど）を適切に学習し、人間の直感に近い類似性を計算できていることがわかります。

<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">順位</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 結果</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 類似度</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 結果</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 類似度</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">差</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">highball_lemon</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.6154</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">highball_lemon</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.6667</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">-0.0513</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">2</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">lemon_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.4814</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">lemon_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.5164</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">-0.0350</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">3</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">lemon_juice</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.3485</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">lemon_juice</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.3333</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">+0.0152</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">4</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">orange_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.2091</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">orange_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.2582</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">-0.0491</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">5</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">kahlua_milk</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0000</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">kahlua_milk</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0000</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0000</td>
    </tr>
  </tbody>
</table>

- 最大差：0.0513（highball_lemon）
- 平均差：0.0301（3.01%）
- 上位 3 位の順位：100%一致

### 補足：ピーチサワーに似た飲み物の検索結果

先ほど「TF-IDF と単語頻度ベクトル」で補足説明した箇所を実際に実行してみました。
レモンサワーの結果と異なるポイントは、**「ピーチ果汁」と「ピーチリキュール」の類似性を判断できるか**です。
**`peach_oolong` の結果に注目してください。**Ruby では自前実装のため少し精度を落とし、単語頻度ベクトルでベクトル化しているため同じピーチ系のドリンクでも「ピーチ果汁」を使用する `peach_highball, peach_mojito, peach_juice` に対して、「ピーチリキュール」を使用する `peach_oolong` は類似性があると判断できず**類似度は 0.0** という結果になりました。一方、Python ではライブラリを使用し類似性があると判断できるため**類似度が 0.1606** と計算されていることがわかります。

<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">順位</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 結果</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Python 類似度</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 結果</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">Ruby 類似度</th>
      <th style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">差</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">1</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_highball</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.6564</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_highball</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.6667</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">-0.0103</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">2</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.5667</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_mojito</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.5164</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">+0.0503</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">3</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_juice</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.4010</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_juice</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.3333</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">+0.0677</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">4</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_oolong</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.1606</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">peach_oolong</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">+0.1606</td>
    </tr>
    <tr>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">5</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">kahlua_milk</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0093</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">kahlua_milk</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">0.0</td>
      <td style="padding: 1px 10px; text-align: center; border-bottom: 1px solid #ddd;">+0.0093</td>
    </tr>
  </tbody>
</table>

- 最大差：0.1606（peach_oolong）
- 平均差：0.0552（5.52%）
- 上位 3 位の順位：100%一致

## 最後に

「レモンサワーに似た飲み物は何だろう？」という単純な疑問から始まり、「まあハイボールだよね」と想定通りの結果を k 近傍法を用いて導くことができました。何気ないこの疑問から技術的な探究に発展するとは思いませんでしたが、興味から入ったからこそ探究心も強く、飽きずにのめり込めたため、今後も真面目にふざける姿勢で探究心を持って学習を続けていきたいと思いました。

きっかけこそくだらない疑問でしたが、机上のアルゴリズム学習で興味を持った k 近傍法を実際に手を動かして触れることにより、データ量によって処理速度の差に違いがあったり、ベクトル化の手法にも様々あることを知ったりと多くの発見がありました。
実装では公式ドキュメントを参考に数行書くだけで実装可能な、 Python のライブラリの強力さを実感したと同時に、Ruby の豊富な標準メソッドの魅力も再認識できました。

特に印象的だったのは、同じアルゴリズムでもベクトル化の手法によって結果が変わることです。Python では TF-IDF で文字レベルの N-gram を採用することで、`peach_juice`と`peach_liqueur`のような微妙な違いも捉えられるようになり、想定通りの結果が出た時にはとても感動しました。

改めて、薬剤師からエンジニアへ転職して楽しいなと思うのは「正確性より、まず動かしてみる」という考え方がメインになったことかもしれません。今回 k 近傍法に関して手を動かしてみるきっかけになったのは、一緒に学ぶ仲間がいたからこそでした。興味を持った内容を議論できる相手がいたから実装に挑戦し、完璧な実装ではありませんが、実際に手を動かして試行錯誤し比較することで多くの学びを得られました。

最後まで読んでくださり誠にありがとうございました！初めての挑戦で締め切りに追われながらも、最後まで真面目にふざけて楽しく書かせていただきました。

## 参考文献

- なっとく！アルゴリズム第2版
