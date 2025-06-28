---
title: "Reactと状態管理"
author: "nakano"
---

# Reactと状態管理

## 必要なJavaScriptのみ個別に読み込みたい
方法が分からず、とりあえず動きゃいい精神でapplication.jsに全部読み込ませてたら、パフォーマンス診断で怒られてしまった（あたり前田のクラッカー）

![スクリーンショット 2023-08-24 10.36.39.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/743aa93d-a3a3-8071-7f88-1fca0294d52e.png)

不必要なjsを読み込んでいるページでブラウザエラーも出ていたので、これを機に直すことに。

## そもそも、なぜapplication.jsに詰め込んだ？
#### Sprockets::Rails::Helper::AssetNotFound in ○○　のエラーになる。
![スクリーンショット 2023-08-24 10.41.42.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/fb89c801-9288-bbc4-d97f-a3c7a215204a.png)

ここでは、top_bubble.jsというファイルを読み込ませようとしていますが、上記エラーでうまくいかず。

#### The asset "top_bubble.js" is not present in the asset pipeline.
「 "top_bubble.js "がアセット・パイプラインに存在しません。」
とあることから、asset周りなのはわかるのですが、どうしたら良いのやら。。。

初学者のため、間違いやまずいやり方があればぜひコメントでご指摘ください🙏

## 確認したこと
#### 1.パスが間違っていないか
#### 2.```app/assets/javascripts```の設定
#### 3.```app/assets/builds```に個別に読み込みたいjsがbuildされているか

 1. と 2.は結果的には関係がなかったのですが、忘備録に簡単に記載しておきます。

https://keruuweb.com/rails-%E5%BF%85%E8%A6%81%E3%81%AAjavascript%E3%81%AE%E3%81%BF%E3%82%92%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%82%80/

上記記事によるとRails６までは```app/assets/javascripts```以下の全てのファイルを自動で読み込んでいたそうです。その設定ファイルが```config/initializers/assets.rb```とのこと。

ただし、今回はRails7を使用していることから、そもそも```app/javascript```にあるのでファイル構成が違います。ものは試しなので下記のように設定を記載してみましたが、結果として3.だけで動いたため関係ありませんでした。

```config/initializers/assets.rb
# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )


Rails.application.config.assets.precompile += %w( custom/*.js ) 
#追加してみたけど関係なかった
#今回個別に読み込みたいjsファイルは全てapp/javascript/custom以下に置いているためcustom/*.jsとなっている
```


https://railsguides.jp/asset_pipeline.html#%E5%88%A5%E3%81%AE%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%82%92%E4%BD%BF%E3%81%86

https://www.wantedly.com/companies/wantedly/post_articles/354873

~~config/initializers/assets.rbはいつ使うのか誰か教えてください😇~~
assets.rbについてはプリコンパイルするファイルを指定する時に必要でした。デプロイ時にエラーが出たので、こちらをご覧ください。

https://qiita.com/MIDO-ruby7/items/9718b40c97e4d282ae83

## 3.app/assets/buildsに個別に読み込みたいjsがbuildされているか
esbuildでは```app/javascript```以下のファイルが自動で```app/assets/builds```
にコンパイルされます。
※コンパイル：人間が書いたコードをコンピュータの処理装置であるCPUが解釈して実行できる形に変換すること。俺たちにとってのDeepleみたいなもんだろ（違）。

[](https://e-words.jp/w/%E3%82%B3%E3%83%B3%E3%83%91%E3%82%A4%E3%83%AB.html)

```app/javascript```
![スクリーンショット 2023-08-24 11.24.49.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/755d02ce-5a43-2b1b-a97a-97031c85a304.png){style="width:70%;"}
```app/assets/builds```
![スクリーンショット 2023-08-24 11.23.06.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/fe49e055-9cfd-db64-9b5c-a80f46b5ea79.png){style="width:70%;"}

ブラウザは、この```app/assets/builds```にコンパイルされたコードを読み取るので、そもそもここにファイルがないとThe asset "top_bubble.js" is not present in the asset pipeline.と言われるわけです。

esbuildの場合、どこにコンパイルのためのコマンドがあるかというと、```package.json```
```package.json
{
  "name": "app",
  "private": "true",
  "dependencies": {
    "@hotwired/stimulus": "^3.2.1",
    "esbuild": "^0.17.19",
         省略
    "tailwindcss": "^3.3.2",
    "trix": "^2.0.5"
  },
  "scripts": {
    "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets",
// ↑ここでapp/javascript/*.* をassets/builds にコンパイルするよう要求している
    "build:css": "tailwindcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css --minify"
  }
}
```

ということでコードを追加。
```package.json
"scripts": {
    "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets",
    "build:css": "tailwindcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css --minify",
    "build:custom": "esbuild app/javascript/custom/*.js --bundle --sourcemap --outdir=app/assets/builds --public-path=assets"
// ↑これを追加
  }
}
```
```$ bin/dev```コマンドで再起動したのですが、yarnコマンド(npm使ってる人はnpm)を打たないと自動ではbuildされないようです。
```$ yarn build:custom```
```
boozefolio % yarn build:custom
yarn run v1.22.19
$ esbuild app/javascript/custom/*.js --bundle --sourcemap --outdir=app/assets/builds --public-path=assets

  app/assets/builds/bubble.js          254.5kb
  app/assets/builds/top_bubble.js      254.4kb
  app/assets/builds/tourguide.js         2.4kb
  app/assets/builds/search.js            945b 
  app/assets/builds/default_values.js    927b 
  app/assets/builds/preview.js           610b 
  app/assets/builds/number-input.js      390b 
  app/assets/builds/bubble.js.map      466.1kb
  app/assets/builds/top_bubble.js.map  466.1kb
  app/assets/builds/tourguide.js.map     3.1kb
  ...and 4 more output files...

✨  Done in 0.23s.
```
```app/assets/builds```に無事コンパイルされました。
![スクリーンショット 2023-08-24 12.04.44.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/456ecb30-b439-5b26-c71e-89a62f340fc1.png)

これを読み込みたいviewファイルで読み込んでやればOK
例　：```<%= javascript_include_tag "top_bubble" %>```

## その他詰まったところ
##### jQueryなどを使用している際は、個別にimportする必要があります。
```app/javascript/custom/top_bubble.js
import "../add_jquery" //コードを追加

var items = 30; 

for (var i = 0; i <= items; i++) {
  var moveVal = Math.ceil(Math.random() * 50); 
  var posVal = Math.ceil(Math.random() * 50);
```

ただ、なぜかjQueryをCDNで読み込まないとimportできず。。。application.jsでは大丈夫だったのになぜなんでしょうか？　むむむ。

```
<%= javascript_include_tag "top_bubble" %>
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
// CDNを追加
```
##### このままではデプロイ時にエラーが出ました。
詳しくは別記事にまとめたので下記をご覧ください。[^1]

[^1]: https://qiita.com/MIDO-ruby7/items/9718b40c97e4d282ae83
