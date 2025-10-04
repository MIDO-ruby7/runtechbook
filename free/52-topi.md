---
title: "Rubyのsortって何ソート？"
author: "とぴ"
---

# Rubyのsortって何ソート？

## はじめに

初めまして！もしくはいつもお世話になっております。RUNTEQ52期生とぴです！
普段はRuby以外にGoやTypeScriptを書いているバックエンドエンジニアです。この本が販売される頃には2年目に突入する、まだまだ駆け出しのエンジニアです🐣
さて、言語によってはソートを一発でできる組み込みメソッドがあります。Rubyのsortもその一つです。
当記事では「Rubyのsortメソッドって、どのようなロジックなんだろう？」という疑問から、C言語を読み解き複数あるソートアルゴリズムのうちどれに当てはまるかを探っていきます。

## 前提

今回の記事は、Ruby 3.4系時点で執筆しています。
C言語の実装部分については、適宜AIを使い内容を深掘りしたものになっています。
コードを抜粋しながら解説を書いておりますが一部省略している部分もありますので、実際にRubyのGitHubを見ながらの閲覧をお勧めします。

最新版：https://github.com/ruby/ruby
<img src="../images/52-topi/01-ruby-github.png" width="100px" />

また、下記内容は取り扱いません。

- C言語の読み方
- 各ソートアルゴリズムの最悪計算量・平均計算量について

## 本編

本編は下記の流れで構成されています。

1. ソートアルゴリズムって何があったっけ？
2. Rubyのsortを深掘りしていこう！
   - 実は要素数で処理が違う！
   - ソート中にGCされない工夫
   - たどり着いた！これがRubyのソートだ！

<br />

## 1. ソートアルゴリズムって何があったっけ？

ソートアルゴリズムはいくつかありますが、代表的なものを6種類解説します。
ソートが完了するまでにかかる計算量は種類によって異なりますが、今回はざっくり「こういうソートだよ」といったものだけを記載します。
最悪計算量や平均計算量などについて知りたい方は下記の書籍がおすすめです。

[データ構造とアルゴリズム　上達のための基本・常識](https://amzn.asia/d/g2acLyi)
<img src="../images/52-topi/02-data-algorithm-book.jpg" width="100px" />

### バブルソート

ソートの動きが、水中に泡が浮かぶような動きから名付けられたバブルソート。隣り合う要素同士の比較、入れ替えを繰り返すことで並び替える手法です。

下記データが配列であるとします。
<img src="../images/52-topi/03-00-bubble.png" width="400px" />

これを、左から右に向かって数字が大きくなるように並び替えていきます。
今回は隣り合う要素を左から順番に比較していき、大きい値を右側に移動させる方法で説明します。
まず、左から1番目と2番目を比較してみると、左から1番目が5、2番目が3で`5>3`なため入れ替えます。
<img src="../images/52-topi/03-01-bubble.png" width="400px" />

次に、左から2番目と3番目を比較してみると、左から2番目が先ほど入れ替えた5で、左から3番目が1であり、`5>1`なため入れ替えます。
<img src="../images/52-topi/03-02-bubble.png" width="400px" />

続いて、左から3番目と4番目を比較してみると、左から3番目が先ほど入れ替えた5で、左から4番目が2であり、`5>2`なため入れ替えます。
<img src="../images/52-topi/03-03-bubble.png" width="400px" />

続いて、左から4番目と5番目を比較してみると、左から4番目が先ほど入れ替えた5で、左から5番目が4であり、`5>4`なため入れ替えます。
<img src="../images/52-topi/03-04-bubble.png" width="400px" />

一番右まで来たので、1回目のソートはこれで終わりです。一番大きい5が一番右に来ましたね。
<img src="../images/52-topi/03-05-bubble.png" width="400px" />
残りの要素で同じ作業を繰り返します。一番右=最後のインデックスは整列済みのため、これを排除しての並び替えです。
同じ作業を繰り返すため、この先の流れは割愛します。

### 選択ソート

選択ソートでは線形探索を利用しているため、まずは線形探索を説明します。

同じく下記の並び順で配列があるとします。
<img src="../images/52-topi/04-01-select.png" width="400px" />

まず、左から1番目の要素(インデックス0)を最小値として保持します。
<img src="../images/52-topi/04-02-select.png" width="400px" />

次に、最小値として保持した数字と左から2番目の数字を比較します。
`3<5`で3の方が小さいので、3を保持します。
<img src="../images/52-topi/04-03-select.png" width="400px" />

続いて同様に、最小値として保持した数字と左から3番目の数字を比較します。
`1<3`で1の方が小さいので、1を保持します。
<img src="../images/52-topi/04-04-select.png" width="400px" />

あとは同様の作業を繰り返します。`1<2`で1の方が小さいので1を保持したままにします。
<img src="../images/52-topi/04-05-select.png" width="400px" />

最後は`1<4`で1の方が小さいので1を保持したままにします。
これで最小値は1とわかりました。
<img src="../images/52-topi/04-06-select.png" width="400px" />

紹介した「最小値を見つける」線形探索を利用して、選択ソートを行なっていきます。
この線形探索では「最小値」を見つけて終わっていますが、選択ソートはここで見つけた最小値を元に並び替えてソートを行なっています。

同様に下記の配列があるとします。
<img src="../images/52-topi/04-07-select.png" width="400px" />

線形探索で最小値を見つけます。
ここでは最小値だけでなく、どこにあったか(インデックス何番にあったか)も保持しておきます。
今回は最小値1がインデックス2にありました。
<img src="../images/52-topi/04-08-select.png" width="400px" />

最小値をソート範囲の一番左の要素と入れ替えます。
インデックス0とインデックス2を入れ替えます。
<img src="../images/52-topi/04-09-select.png" width="400px" />

これで最小値=インデックス0はソート済みとなりました。
残りの範囲で同様の手順を繰り返します。
<img src="../images/52-topi/04-10-select.png" width="400px" />

### 挿入ソート

挿入ソートから少しややこしくなっていきます。同様に、下記配列があるとします。
<img src="../images/52-topi/05-01-insert.png" width="400px" />

まず、左から1番目から比較しますがここでは比較対象がないため操作を終了とします。
<img src="../images/52-topi/05-02-insert.png" width="300px" />

次に、左から2番目と左隣を比較します。`5>3`で3の方が小さいため、左隣と入れ替えます。3が1番左へ来たため3の操作は終了です。
<img src="../images/52-topi/05-03-insert.png" width="350px" />

続いて、左から3番目と左隣=左から2番目を比較します。`5>1`と1の方が小さいため入れ替えます。
<img src="../images/52-topi/05-04-insert.png" width="350px" />

1にはまだ左があるため、さらに比較します。`3>1`で1の方が小さいため、左隣と入れ替えます。
<img src="../images/52-topi/05-05-insert.png" width="350px" />

1が1番左に来たので、1の操作は終了です。
<img src="../images/52-topi/05-06-insert.png" width="350px" />

左から4番目と左隣=左から3番目と比較します。`5>4`となるため入れ替えます。
<img src="../images/52-topi/05-07-insert.png" width="350px" />

4にはまだ左があるため、さらに比較します。`3<4`となり3の方が小さいため入れ替えません。4の操作はここで終了です。
<img src="../images/52-topi/05-08-insert.png" width="350px" />

残りの要素も同様に繰り返します。左隣と比較し、左より小さければ入れ替え、左以上であれば入れ替えません。
<img src="../images/52-topi/05-09-insert.png" width="350px" />

### ヒープソート

ヒープソートは、まずデータをヒープ構造にしてからソートするやり方です。
ヒープ構造は簡単にいうと木構造で親は`1～2`の子を持つ状態です。今回は「根(親)は子より大きい」ヒープ構造とします。
まずこれまで通りの配列があるとします。
<img src="../images/52-topi/06-01-heap.png" width="200px" />

配列を下記画像のようなヒープ構造にします。
<img src="../images/52-topi/06-02-heap.png" width="200px" />

根は常に1番大きい数字なため、根を取り出し配列の1番右へ配置します。
<img src="../images/52-topi/06-03-heap.png" width="200px" />
<img src="../images/52-topi/06-04-heap.png" width="400px" />

残りの要素でヒープ構造を再構築します。
<img src="../images/52-topi/06-05-heap.png" width="400px" />

再び根を取り出し配列の右から2番目に配置します。
この操作を繰り返すことでヒープソートができます。
<img src="../images/52-topi/06-06-heap.png" width="400px" />

### マージソート

マージソートは、分割を繰り返した後に要素を比較してソートする方法です。
今回は分かりやすいように下記の配列があるとします。
<img src="../images/52-topi/07-01-merge.png" width="400px" />

まずは配列を単体になるまで半分に分割するのを繰り返します
<img src="../images/52-topi/07-02-merge.png" width="380px" />

最初に半分にしたうちの各ブロックの左右を比較します。左から1番目と2番目を比較して小さい数字が左にくるように入れ替えます。
<img src="../images/52-topi/07-03-merge.png" width="380px" />

2つ目のブロックも同様に比較し小さい数字が左にくるように入れ替えます。
<img src="../images/52-topi/07-04-merge.png" width="370px" />
今回は要素数が7つで`4:3`で要素数が分かれるため、ここで全体要素数の半分が１度目の操作を終えたことになります。

次のブロック同士の比較を行います。
<img src="../images/52-topi/07-05-merge.png" width="370px" />

<img src="../images/52-topi/07-06-merge.png" width="370px" />

<img src="../images/52-topi/07-07-merge.png" width="400px" />

ソート済みでない残りの半分も同様の手順を繰り返します
<img src="../images/52-topi/07-08-merge.png" width="400px" />

<img src="../images/52-topi/07-09-merge.png" width="400px" />

<img src="../images/52-topi/07-10-merge.png" width="400px" />

<img src="../images/52-topi/07-11-merge.png" width="400px" />

最後まで繰り返すとマージソートの完成です。

### クイックソート

クイックソートは基準値をランダムに決めて比較・整列を繰り返していくソートです。
下記のように配列があるとします。
<img src="../images/52-topi/08−01-quick.png" width="400px" />

まず適当にピボット（基準値）を配列の中から決めます。
<img src="../images/52-topi/08−02-quick.png" width="400px" />

ピボットと配列の数字を比較します。
<img src="../images/52-topi/08−03-quick.png" width="400px" />

ピボットより大きければ右へ、小さければ左へ入れていきます。
<img src="../images/52-topi/08−04-quick.png" width="400px" />

全て比較したらこのターンは終了です。
<img src="../images/52-topi/08−05-quick.png" width="400px" />

ピボットはソート済みとし、左右ごとに同様の作業を繰り返していきます。
<img src="../images/52-topi/08−06-quick.png" width="400px" />

これがクイックソートです。

## 2. Rubyのsortを深掘りしていこう！

どのようなソートがあるかがわかったところで、いよいよRubyのsortメソッドの中身をみていきましょう！

### 実は要素数で処理が違う！

まずは定義を確認してみましょう。書いてあるのは`array.c`ファイルです。
ご存知の方も多いかと思いますが、Rubyは基本C言語で書かれているため読み進めていくのはC言語がメインとなります。

```c:array.c
// 8762行目
rb_cArray  = rb_define_class("Array", rb_cObject);
// 省略
// 8813行目
rb_define_method(rb_cArray, "sort", rb_ary_sort, 0);
```

`sort`は`rb_ary_sort`という名前の関数で実装をしているようです。
この`rb_ary_sort`の中身は同じファイル内の3499行目あたりにあります。

```c
VALUE
rb_ary_sort(VALUE ary)
{
    ary = rb_ary_dup(ary);
    rb_ary_sort_bang(ary);
    return ary;
}
```

例えば`[4,1,6,2,0]`という配列があったとして、sortメソッドを使うと`[4,1,6,2,0].sort`といった使い方をします。
配列に対しソートを行なっていること、配列はarrayと呼ぶことから`(VALUE ary)`と設定されている引数はソートしたい配列が入ることがわかります。

```c
ary = rb_ary_dup(ary);
```

ここでは引数の配列を`rb_ary_dup`なる関数にいれており返り値をaryに再代入しています。
`dup`は英語のduplicate(複製)の略を表しているため、ここだけ読むと「引数の配列を複製している」ことがわかります。
「Rubyにもdupというメソッドがある！」とお気づきの方は素晴らしいです。このdupもduplicateを意味しています。
`rb_ary_dup`は分解すると

- rb = ruby
- ary = array
- dup = duplicate

ということでそのまま「配列の複製」をしているのがわかります。
ここで「配列複製しているんだな」で終わっても良いのですが、せっかくなのでこの中ものぞいてみましょう。

```c:array.c
// 2787行目
VALUE
rb_ary_dup(VALUE ary)
{
    long len = RARRAY_LEN(ary);
    VALUE dup = rb_ary_new2(len);
    ary_memcpy(dup, 0, len, RARRAY_CONST_PTR(ary));
    ARY_SET_LEN(dup, len);

    ary_verify(ary);
    ary_verify(dup);
    return dup;
}
```

```c
long len = RARRAY_LEN(ary);
VALUE dup = rb_ary_new2(len);
```

ここの部分は、配列のサイズを取得しそのサイズ分の配列を作成しています。この時点で`dup`はまだサイズ分だけ用意された空配列です。
今回覗いていきたいのはこのコードの中の`ary_memcpy(dup, 0, len, RARRAY_CONST_PTR(ary));`です。
ary = array, mem = memory, cpy = copy の略なので配列をメモリにコピーしている処理だろうと予想ができます。
この中身がまた面白いのです！

```c:array.c
// 342行目
static void
ary_memcpy(VALUE ary, long beg, long argc, const VALUE *argv)
{
    ary_memcpy0(ary, beg, argc, argv, ary);
}
```

`ary_memcpy0`を返却しているのでこの中を見ていきます。`ary_memcpy`のすぐ上に定義されています。

```c:array.c
// 321行目
static void
ary_memcpy0(VALUE ary, long beg, long argc, const VALUE *argv, VALUE buff_owner_ary)
{
    RUBY_ASSERT(!ARY_SHARED_P(buff_owner_ary));

    if (argc > (int)(128/sizeof(VALUE)) /* is magic number (cache line size) */) {
        rb_gc_writebarrier_remember(buff_owner_ary);
        RARRAY_PTR_USE(ary, ptr, {
            MEMCPY(ptr+beg, argv, VALUE, argc);
        });
    }
    else {
        int i;
        RARRAY_PTR_USE(ary, ptr, {
            for (i=0; i<argc; i++) {
                RB_OBJ_WRITE(buff_owner_ary, &ptr[i+beg], argv[i]);
            }
        });
    }
}
```

上記が配列をメモリにコピーしている処理です。メモリのコピーに分岐があるのがわかります。

```c
if (argc > (int)(128/sizeof(VALUE)))
```

こちらですね。`argc`は`RARRAY_LEN(ary)`を入れているので配列のサイズを表しています。
`VALUE`はなんぞやというと、

```c:include/ruby/internal/value.h
typedef uintptr_t VALUE;
```

ここで定義されています。
元々VALUEは`unsigned long`型だったらしいのですが、プラットフォーム間でサイズが異なることがありそれを解消するために`uintptr_t`を使うように変更されました。
つまりCPUアーキテクチャが異なってもポインタを使うことでプラットフォームのポインタのサイズに合わせるようにしているのです。

ですので、`sizeof(VALUE)`はプラットフォームアーキテクチャに合わせたポインタサイズを表しています。
`128/sizeof(VALUE)`で128で割っていますね？128は`/* is magic number (cache line size) */`とあるのでキャッシュラインのサイズのようです。
（なぜ128なのかは https://shopify.engineering/ruby-variable-width-allocation を参考にすると良いでしょう）
ですので、キャッシュラインのサイズをポインタサイズで割った時に、要素数より大きい場合と小さい場合で処理が異なっているのです！
これは処理の最適化を目的としてこのようにしているようです。この条件分岐の中身は次の話に続きます。

### ソート中にGCされない工夫

条件分岐の中身をそれぞれ見ていきましょう。まずは要素数が`(int)(128/sizeof(VALUE))`より多い場合です。

```c
rb_gc_writebarrier_remember(buff_owner_ary);
RARRAY_PTR_USE(ary, ptr, {
   MEMCPY(ptr+beg, argv, VALUE, argc);
});
```

`rb_gc_writebarrier_remember(buff_owner_ary);`は簡単にいうと**GC（ガベージコレクション）されないように生きているものとして扱う**ように設定しています。一括で設定することで処理の高速化を狙っています。
`RARRAY_PTR_USE`の中で`MEMCPY`とメモリコピーをしていますが、要素数が大きすぎてメモリコピーしている間にGCされないように工夫しているんですね。

一方、要素数が`(int)(128/sizeof(VALUE))`以下の場合は

```c
RARRAY_PTR_USE(ary, ptr, {
   for (i=0; i<argc; i++) {
         RB_OBJ_WRITE(buff_owner_ary, &ptr[i+beg], argv[i]);
   }
});
```

なんとfor文で要素を1つずつコピーしています。こちらのGC対策は`RB_OBJ_WRITE`の中で行っていますが、先ほどと違い要素1つずつGC対策していることになります。
要素数とプラットフォームアーキテクチャで処理が変わるのは面白いですね！

### たどり着いた！これがRubyのソートだ！

いい感じに深掘りしたところで戻ってきましょう。

```c
VALUE
rb_ary_sort(VALUE ary)
{
    ary = rb_ary_dup(ary);
    rb_ary_sort_bang(ary);
    return ary;
}
```

`ary = rb_ary_dup(ary);`の中には複製された配列が入ります。実際にソートしているのは`rb_ary_sort_bang(ary);`ですね。
ではこの中身を見ていきましょう。

```c:array.c
VALUE
rb_ary_sort_bang(VALUE ary)
{
    rb_ary_modify(ary);
    RUBY_ASSERT(!ARY_SHARED_P(ary));
    if (RARRAY_LEN(ary) > 1) {
        VALUE tmp = ary_make_substitution(ary); /* only ary refers tmp */
        struct ary_sort_data data;
        long len = RARRAY_LEN(ary);
        RBASIC_CLEAR_CLASS(tmp);
        data.ary = tmp;
        data.receiver = ary;
        RARRAY_PTR_USE(tmp, ptr, {
            ruby_qsort(ptr, len, sizeof(VALUE),
                       rb_block_given_p()?sort_1:sort_2, &data);
        }); /* WB: no new reference */
        rb_ary_modify(ary);
        // ...省略
    }
    ary_verify(ary);
    return ary;
}
```

いっぱい書かれているので一部省略していますがざっくり見ていきましょう。
`RARRAY_LEN(ary) > 1`は配列のサイズが1より大きいかどうかなので、サイズが1であれば配列をそのまま返しています。
サイズが1より大きい場合はなんだか色々やっていますね。埋め込みだのヒープだのポインタだのなんだかややこしそうです。
ここの中身をさらに深掘りしていくともはや私だけで一冊書いたほうがいい気がしてくる（~~深掘りする時間がなかったともいう~~）ので、ズバリソートをしている部分のみ抜粋します。
それがここです。

```c
RARRAY_PTR_USE(tmp, ptr, {
   ruby_qsort(ptr, len, sizeof(VALUE),
               rb_block_given_p()?sort_1:sort_2, &data);
});
```

`ruby_qsort`がソートをしている処理です。勘の鋭い方はわかったかもしれませんが深掘りしていきましょう。
`util.c`の208行目以降にあります。行数多すぎてここに書くのは憚られるのでGitHubのコードを片手に読んでください。
`ruby_qsort`は3つのタイプに分かれます。

- BSDにqsortが定義されている時（190行目：`#if defined HAVE_BSD_QSORT_R`）
- qsort_sが使える時（229行目：`#elif defined HAVE_QSORT_S`）
- それ以外

BSDにqsortが定義されている時のコードは

```c
ruby_qsort(void* base, const size_t nel, const size_t size, cmpfunc_t *cmp, void *d)
{
    struct bsd_qsort_r_args args;
    args.cmp = cmp;
    args.arg = d;
    qsort_r(base, nel, size, &args, cmp_bsd_qsort);
}
```

qsort_sが使える時のコードは

```c
ruby_qsort(void* base, const size_t nel, const size_t size, cmpfunc_t *cmp, void *d)
{
    if (!nel || !size) return;  /* nothing to sort */

    /* get rid of runtime-constraints handler for MT-safeness */
    if (!base || !cmp) return;
    if (nel > RSIZE_MAX || size > RSIZE_MAX) return;

    qsort_s(base, nel, size, cmp, d);
}
```

それ以外は`util.c`の`361行目`にあります。コードが長いので書きません。
BSDにqsortが定義されている場合は`qsort_r`、`qsort_s`が使える場合は`qsort_s`を使っています。
それぞれのドキュメントが下記です。

https://man.freebsd.org/cgi/man.cgi?query=qsort_r (FreeBSD)

> The qsort_r() function behaves identically to qsort(), ...
> The qsort() function is a modified partition-exchange sort, or quick sort.

https://learn.microsoft.com/ja-jp/cpp/c-runtime-library/reference/qsort-s?view=msvc-170 （Microsoft C++、C、およびアセンブラーのドキュメント）

> クイック ソートを実行します。

クイックソートを使っています！そう、つまりRubyのsortはクイックソートなのです！！
ずいぶん遠回りしたような気がしますがようやく辿り着きました、Rubyのsortはクイックソートです！！

## 結論

Rubyのsortはクイックソートです。ソートの種類をそれぞれ解説し、C言語コードを深掘りし、横道それながら無事見つけましたね。
プラットフォームの差異によって道中の処理は異なっていました。これによってRubyは処理を高速させたりGCを操作したりしています。
Rubyのコードの読み方もちょっとわかりましたね！ちょっとね！

## 終わりに

今回の記事を通して**言語やOSSの中身の覗き方**が伝われば良いなぁと思っています。画像が多くコードも多い記事になってしまい、なんども主催者であるMIDORIさんに「ページが！！ページが！！」と叫びました。この校閲や調整も苦労しそうな気がしています。お手数おかけします……。
しかしながら「自由に書いていいよ！」と背中を押してくださったため、のびのびと（のびのびすぎた）書くことができました。
改めまして、主催のMIDORIさん、柊さん、デザインを担当してくださった佐々木さん、とても良い機会をくださり本当にありがとうございます。
そして当記事を読んでくださった読者の皆さん！本当にありがとうございますｯﾋﾟ！！

## 参考

- [データ構造とアルゴリズム　上達のための基本・常識](https://amzn.asia/d/g2acLyi)
- [アルゴリズム図鑑 増補改訂版 絵で見てわかる33のアルゴリズム](https://amzn.asia/d/bE9QnHM)
- [Ruby Hacking Guide](https://ruby-hacking-guide.github.io/)
- [Optimizing Ruby’s Memory Layout: Variable Width Allocation](https://shopify.engineering/ruby-variable-width-allocation)
- [FreeBSD Manual Pages qsort_r](https://man.freebsd.org/cgi/man.cgi?query=qsort_r)
- [qsort_s | Microsoft Learn](https://learn.microsoft.com/ja-jp/cpp/c-runtime-library/reference/qsort-s?view=msvc-170)

## 執筆者

とぴ
RUNTEQ52期生(2023/12-2024/09)
https://x.com/topi_log
<img src="../images/52-topi/qrtool.png" width="100px" />
