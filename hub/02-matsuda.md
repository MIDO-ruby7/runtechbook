---
title: "RustでCLIツール開発"
author: "matsuda"
---

この記事は、プログラミングスールRUNTEQ内で[けーすけさん](https://twitter.com/saku0suke)が主催する「Advent Calendar Challenge」に参加しております。素敵な企画ありがとうございます。

https://advent-calendar-challenge.onrender.com/

# Cloudflareで独自ドメインを取得する

### ①Cloudflareに登録・ログイン

右上のプルダウンから日本語にも変えられます。
![スクリーンショット 2023-10-21 21.05.30.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/1835550e-803b-9001-bf5a-e6bae8e8730d.png)


### ②Domain Registration > Register Domain
左のメニューからRegister Domainを選択し、
![スクリーンショット 2023-10-21 21.07.40.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/f620bc57-ebcb-8f72-86d0-5575858727c8.png)

🔍検索バーから、取得したいドメイン名を検索

![スクリーンショット 2023-10-21 21.13.03.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/29cd6cfe-90f0-36c0-985e-a4353dd89aad.png)


### ③取得したいドメイン名を選択し、フォームに情報を入力して購入

![スクリーンショット 2023-10-21 21.22.35.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/2e7cfa1c-eecc-3dee-02f9-a54821d003a1.png)

![スクリーンショット 2023-10-21 21.23.12.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/929350a1-6b84-5b31-ff41-15b5471fe5d2.png)

楽天カードはなぜか使えません😇

### ドメイン取得が完了したら以下のようなメールが来る
![スクリーンショット 2023-10-21 21.40.35.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/214b5803-3d00-0ea0-7fbd-0b5e5b9a9c12.png)

ドメインが自動更新に設定されている場合、Cloudflareは有効期限の30日前に自動的にドメインが更新される

# 取得した独自ドメインをherokuで設定する

### ①heroku側の設定を行う

独自ドメインを設定したいアプリのsetting画面に遷移する
![スクリーンショット 2023-10-21 21.51.05.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/0bf7c000-088c-6ff6-47ab-63178af41e23.png)

下にスクロールすると、"SSL Certificates"と"Domains"がありこの２つを設定していく
![スクリーンショット 2023-10-21 21.52.08.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/e0733182-0fff-568e-17a5-9c1d54838e35.png)

#### SSL Certificatesを設定する
まず、「Configure SSL」ボタンを押し、"Automatic Certificate Management (ACM)"を選択して「Next」を押す。


![スクリーンショット 2023-10-21 21.52.44.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/0d6023c0-1c11-d876-f8a8-5231285f6e3d.png)


ACMは、TLS/SSLサーバ証明書をheroku側で自動で自動的に管理してくれる設定。
______
【補足：SSLサーバ証明書って？】
>SSLサーバ証明書をWebサイトに設定することによって、「なりすましの防止」、やり取りされるデータの「改ざん検知」、「盗聴防止」、「中間者攻撃による通信の改ざんを検知」といった効果が得られます。アクセスしているページにSSLサーバ証明書の設定がされており、SSLによって暗号化保護がされているかを確認する手段は、ブラウザのアドレスが「https://」となっているかどうかで判断できます。

https://www.jipdec.or.jp/library/report/ssl_cert.html

___

"Your certificate is automatically managed. Add a custom domain to your app."と出ていればOK

![スクリーンショット 2023-10-21 21.53.01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/c5dd4b42-5e05-c3b4-e175-23c58d112e91.png)

#### Domainを設定する。
「Add domain」を選択し、取得したドメインを入力して「Next」
(例：kanzen-ni-rikaishita.com)

![スクリーンショット 2023-10-21 21.53.01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/c5dd4b42-5e05-c3b4-e175-23c58d112e91.png)

この画面が出てくるため"DNS target"のURLを控えておく。
![スクリーンショット 2023-10-21 21.54.21.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/b7a33bc7-3264-edb2-2568-853a3b1f356c.png)

サブドメインが必要であれば、さらに「Add domain」で追加する。
(例：www.kanzen-ni-rikaishita.com)

### ②Cloudflareで独自ドメインとherokuの発行したURLを紐付ける
CloudflareのHome(websites)から、設定したい独自ドメイン(ここでは、kanzen-ni-rikaishita.com)を選択する。

![スクリーンショット 2023-10-21 21.56.09.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/056dedd4-f99d-c989-cebb-f7dd2a3d0cd2.png)

DNS > Recordsを選択する
![スクリーンショット 2023-10-21 21.56.33.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/abfb35f2-7630-249b-220f-cd2f1e43661b.png)

「Add record」を押す
![スクリーンショット 2023-10-21 21.57.57.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/7b52c6de-6a99-5ce5-a221-49bab6343d35.png)

⚫️Typeに「CNAME」
CloudFlareではrootもサブドメインもCNAME​

https://devcenter.heroku.com/ja/articles/custom-domains#configuring-dns-for-root-domains

⚫️Nameにサブドメインを入力。
（サブドメインなし(root)の場合は「@」。ここでは「www」を入力し、https://kanzen-ni-rikaishita.com でも https://www.kanzen-ni-rikaishita.com 両方でアクセスできるように２つ登録）

⚫️targetにherokuのDNS targetを入力し「save」

![スクリーンショット 2023-10-21 22.00.22.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/78420cda-c97f-885f-a723-caa8da042801.png)

Proxy statusについては理解が浅いため間違いがあればご指摘ください。

onにするとCloudflare のグローバルネットワークを利用し、これによりキャッシュの最適化やより強固なセキュリティ保護を受けることができるようになりますが、DNSで登録されていたオリジンのIPアドレスではなく、Cloudflare の IP アドレスが返ってきます。
はてなブログなどIPアドレスの情報と紐づける場合はDNS onlyにしなければいけないようです。herokuはProxiedで設定できたのでこのままにしています。

参考：

https://dev.classmethod.jp/articles/cloudflare-dns-basics-what-is-proxy/

https://blog-dry.com/entry/2023/07/12/071049

参考：CNAME

https://e-words.jp/w/CNAME%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89.html

https://www.cloudflare.com/ja-jp/learning/dns/dns-records/dns-cname-record/

この状態ではまだheroku側に設定が反映されていません。
※撮り忘れたので別のアプリの写真を使用しています。すみません
![スクリーンショット 2023-10-23 11.29.40.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/779fe3dd-5579-5d62-9703-01457b8b3245.png)


アプリのターミナルで```$ heroku domains```と打ってください。
``` boozefolio % heroku domains
 ›   Warning: heroku update available from 8.4.2 to 8.6.0.
=== boozefolio Heroku Domain

boozefolio.herokuapp.com

=== boozefolio Custom Domains

 Domain Name      DNS Record Type DNS Target                                            SNI Endpoint       
 ──────────────── ─────────────── ───────────────────────────────────────────────────── ────────────────── 
 sakekuzu.win     ALIAS or ANAME  aaaaaaaaaaaaaaafb.herokudns.com abcdefgs-111111
 www.sakekuzu.win CNAME           daaaaaaaaaaaaaaafb.ns.com      abcdefwwww-222222
```
Domain Nameが設定されていることを確認したら、
```$ heroku domains:wait ドメイン名```

例
```
 boozefolio % heroku domains:wait sakekuzu.win
 ›   Warning: heroku update available from 8.4.2 to 8.6.0.
Waiting for sakekuzu.win... done
```

![スクリーンショット 2023-10-23 11.50.26.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/a420d821-4b5a-a1fc-82b6-5f38f09d38ac.png)


これで完了です。

# ところで独自ドメイン is 何？
よく分からないまま取得してしまっていますが、改めて独自ドメインが何なのかも少しまとめてみたいと思います。

## 独自ドメインとは
・インターネット上のアプリの住所。サーバーの位置情報を示すIPアドレスを変換した文字列の部分。
・https://runteq.jp の場合、runteq.jpの部分がドメイン。ここが自分独自のもの、ということ。
・独自ドメインは戸建てを買うイメージ。自分だけ使える、自分のもの。一方でherokuなどで取得したURLは共有ドメインで、賃貸に入居してるイメージ。

https://www.onamae.com/column/domain/50/

https://www.value-domain.com/media/only_domain/

## 独自ドメインを取得すると何がいいの？
・URLが変わらない
共有ドメインの場合、サービス会社の終了・変更によってドメイン名が変更される可能性があります。
・信頼面
ドメイン名に会社やお店の名前、サイト名を含ませることで認知度や信頼感を高めることができます。(詐欺サイトでこの面を利用されている、という側面もありますが...)
・SEO効果がある
・メールアドレスにも使える
などがあります。

あとポートフォリオ的には必須とのご意見も
<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">ドメイン・HTTPS対応<br>この辺りから実践的な内容。<br>独自ドメインとHTTPSの対応は必須です。サーバはherokuでもいいですが、<a href="https://t.co/7oVyybP5Oc">https://t.co/7oVyybP5Oc</a>はポートフォリオ感丸出しなので絶対NGです。独自ドメインを設定する際にDNSを正しく理解しておくとその後の作業や運用もスムーズとなります。<br><br>続く</p>&mdash; ひさじゅ@Web系転職に強いプログラミングスクールRUNTEQ (@hisaju01) <a href="https://twitter.com/hisaju01/status/1270261735476219905?ref_src=twsrc%5Etfw">June 9, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

https://www.value-domain.com/media/only_domain/

https://muumuu-domain.com/supports/about-domain

## どこで取得できるの?

https://jyn.jp/compare-domain-registrar/

上記のブログ、忖度なしで書いてあり大変参考になりました。
・お名前.com(GMO)
・スタードメイン(ネットオウル)
・ゴンベエドメイン(インターリンク)
・JPDirect(JPRS)
・Google Domains(Google)　⚠️現在サービス終了
・Cloudflare Registrar(Cloudflare)
・AWS Route53(Amazon)
・Gandi.net (Gandi)
の比較が載っています。
今回は、安全性を重視かつ個人サービスなので安さも求めたいという理由でCloudflareを使用してみることにしました。

## 独自ドメインを取得する上で知っておくべきこと

#### 1.ブラウザはIPアドレスに対してHTTPリクエストを行っている

ブラウザがURLをリクエストすると、以下の図ようにレスポンスを返します。

![スクリーンショット 2023-10-23 13.12.30.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/d679ba0d-45dd-482f-3f28-ff8a31dea1bf.png)

>①PCがDNSキャッシュサーバーに、ドメイン名でアクセスする
②DNSキャッシュサーバーがDNSルートサーバーに、管理情報ドメイン名に対応するIPアドレスは何かを問い合わせる
③DNSルートサーバーがDNSキャッシュサーバーに、管理情報のあるDNSサーバーを知らせる
④DNSキャッシュサーバーが管理情報のあるDNSサーバーに、ドメイン名に対応するIPアドレスを問い合わせる
⑤管理情報のあるDNSサーバーはDNSキャッシュサーバーに、IPアドレスを回答する
⑥DNSキャッシュサーバーはPCに、IPアドレスを回答する
⑦PCはIPアドレスでWebサイトにアクセスし、ブラウザ上にWebサイトが表示される

https://www.kagoya.jp/howto/it-glossary/domain/web-01/ 
https://www.kagoya.jp/howto/it-glossary/domain/dns-server/ より引用

サブドメインに対するクエリの場合、さらに追加のネームサーバー(DNSサーバー)が追加され、そのネームサーバーはサブドメインのCNAMEレコードの保存します。

### 2.独自ドメインにかかる費用は取得費だけでない


上記のように、独自ドメインを取得することはただの文字列の売買でなく、ドメインをネームサーバーに登録する必要があります。また、取得するだけでなく所有者の登録、情報の更新など管理も必要です。

Cloudflareなどはドメインレジストラと呼ばれ、このドメインとサーバーの設定や管理を行い、ドメイン名を購入・登録できるサービスを提供している組織です。当然、そのサービスや料金体制にはそれぞれ違いがあります。

Cloudflareの場合、この登録・更新費・管理費なども全て込みの年額で変動がないため分かりやすいのも良かったです。

他社では「初年度の登録費は無料だけど次年度からは更新に数千円かかる」「Whois登録は申し込まないとやってくれない」「ドメインの更新が自動でなく、期限を過ぎたら手数料が発生した」など色々と異なるので注意が必要です。

https://qiita.com/minorun365/items/790635f211a14ad6b4db

https://domain-talk.net/domain-column/comb-whois/

## 3.Whois情報に個人情報が表示される
独自ドメインは戸建てを買うイメージと言いましたが、家を買うと登記するように、独自ドメインも誰がそのドメインを持っているかなどの情報が登録・公開されます。
![スクリーンショット 2023-10-23 15.07.33.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2817989/24fcc11b-08c1-bb5e-9e6f-84e26bbfb642.png)

(香川に住んでるのバレるやん)

お名前.comなどのサービスでは「Whois情報公開代理」を代行するかどうか選択する必要がありますが、これを選択すると、whois情報に表示される個人や会社の情報の代わりに、独自ドメイン取得に使ったドメイン会社の情報が表示されるようになります。Cloudflareの場合デフォルトでWhois情報公開代理が付属しています。

ただし、ドメインの種類によっては登録者や連絡先などの公開が必須の場合もあります。
公開されているメールアドレスにドメインに関する警告や更新を煽るような内容のフィッシング詐欺メールが届くこともあるそうなので、自分の情報が公開されているかどうか知っておく必要があるかもしれません。

## 4.ドメインには保有期限があり、使用実績のあるドメインは、他のサイトからのリンク設定や検索エンジンの評価が残っている

https://www.cybersecurity.metro.tokyo.lg.jp/security/guidebook/286/index.html

何気なく取得したドメインが実は最近まで詐欺サイトとして使われていた、という可能性もあります。独自ドメインを手放したのちに、そういったリスクもあることを知っていないと思わぬトラブルに繋がりそうです。


## 5.SSL化で通信を暗号化する必要がある
独自ドメインを設定しただけでは、「このページは安全ではありません」等の警告がブラウザに表示されます。これは、HTTP接続のままだからです。HTTPは平文で情報をやり取りするため、暗証番号やクレジットカード番号などが第三者に傍受される可能性があります。SSLはデータの暗号化を行う仕組みで、これを防ぐものです。

簡単なサンプルアプリなら必要ないかもしれませんが、ログイン機能などがある場合はSSL化が必須かと思います。

=====================================

勉強していて私があまり意識できていなかったと感じた部分は以上です。
他にも注意点があればぜひコメント等で教えてください🙏

## Cloudflareで取得した独自ドメインをHerokuで設定する方法を振り返る
ここまで書いてきて、改めてCloudflareで取得した独自ドメインをHerokuで設定するとき、何の作業を行なっていたのか振り返りたいと思います(長い😇)


・前提として、Herokuでデプロイしたアプリは、Herokuの共有ドメインが割り当てられる ([app name].herokuapp.com)。つまり、herokuapp.com​ および herokudns.comのネームサーバーへリクエストしてIPアドレスを探してWEBページを表示させている

・Herokuのsettingで「Domain」を追加すると「DNS target」が発行されネームサーバーに登録される。DNS targetは通常、ドメイン名を別のドメイン名に関連付けるCNAME（Canonical Name）レコードの値として使われる。このCNAMEレコードは、Herokuのアプリにアクセスするための一意の識別子となる

・DNS targetを使用してCloudflareで独自ドメインとHerokuドメインと関連付ける

・```$ heroku domains:wait```で関連付けを反映させる

・「SSL Certificates」でSSLを設定する。


### 独自ドメイン、完全に理解した🌝


#### その他参考サイト

https://blog.rmblankslash.net/entry/2021/09/21/080000



https://lpi.or.jp/lpic_all/linux/network/network07.shtml
