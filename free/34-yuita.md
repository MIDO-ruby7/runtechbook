---
title: "Goで簡単なAPIを作ってみた"
author: "ゆいた"
---

# Goで簡単なAPIを作ってみた

## はじめに
私はGoで簡単なAPIを作ってみたのでその解説を行っていきます。この記事を通して、Goに入門するときに知っておきたいこと、気をつけたいことなどを共有できればと思っています。

## 対象読者
本書はGoの初学者向けに書いているので基本的な内容がほとんどです。

## Goについて
最初に簡単にGoについて解説しておきます。GoはGoogleが開発した**シンプルさと高性能を両立**した言語として、多くの企業で採用されています。WebAPI開発やマイクロサービス、クラウドネイティブアプリケーションやKubernetes・Dockerなどのコンテナ技術の分野など、幅広い分野で使用されています。

## 本書で扱うサンプルについて
本書で使用したサンプルコードはGithub上に公開しています。
- https://github.com/yuita-yoshihiko/go-sample-api

Goのバージョンは**1.25.0**を使用しています。

## 本題に入る前に
本題に入る前に、初めてGoを触る人向けにGoでHelloWorldを出力する方法を簡単に解説しておきます。Goでは以下のようなコードでHelloWorldを出力することができます。

```go:main.go
package main

import "fmt"

func main() {
	fmt.Println("Hello, World")
}
```

### パッケージシステムについて
以下の部分はパッケージ宣言です。
```go
package main
```
Goのコードは必ずファイルの先頭にパッケージ名を書きます。`package main`は特別な意味を持ち、**実行可能なプログラム**であることを示します。ライブラリとして使用する場合は、`package usecase`や`package models`のように、その役割に応じた名前を付けます。

### インポート文の仕組み
```go
import "fmt"
```
ここで書かれているimportは他のパッケージを使えるようにする宣言です。fmtパッケージはGoの標準ライブラリの1つです。複数のパッケージを使用する場合、以下のようにパッケージを()で囲みます。
```go
import (
	"context"
	"fmt"
)
```
この書き方により、**依存関係が明確**になり、どのパッケージを使用しているかが一目で分かります。

### main関数の特別な役割
この部分は関数宣言です。
```go
func main() {
	fmt.Println("Hello, World")
}
```
`main`関数は**プログラムのエントリーポイント**となる特別な関数です。プログラム実行時に最初に呼び出されます。この処理ではfmtパッケージのPrintln関数を使い、引数に"Hello, World"を渡しています。Println関数は標準出力を行う関数なので、このコードを実行するとHello, Worldを出力することができます。

プログラムは`go run`コマンドで実行することができます。
```shell
go run main.go
```

Goのコードを書く上で基本となる部分を解説したところで、実際のAPIのコードを見ていくことにします。

## アーキテクチャ設計について
今回作成したAPIのディレクトリ構成は以下のようになっています。

```sh
go-sample-api/
├── adapter/ # 外部システムとのインターフェースの実装
│   ├── api/
│   │   └── router/
│   │       └── router.go
│   └── database/
│       └── testfixtures/
├── cmd/ # アプリケーションのエントリーポイント
├── config/ # 環境変数など、アプリケーションの設定管理
├── infrastructure/ # 外部システムとの接続管理
│   └── db/
│       └── migrations/
├── initdb/
├── models/ # アプリケーションの中心となるデータ構造の定義
├── testutils/ # テスト用汎用関数置き場
├── tmp/
│   ├── build-errors.log
│   └── main
├── usecase/ # ビジネスロジック
│   └── repository/
├── dbconfig.yml # マイグレーション用の設定ファイル
├── docker-compose.testdb.yml
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
├── makefile
└── README.md
```

それではここから主要ファイルの解説を行っていきます。

## アプリケーションの起動プロセス
まずはアプリケーションのエントリーポイントとなるcmdディレクトリの内容について解説していきます。
```go:./cmd/main.go
package main

import (
	// 略
)

func main() {
    // 環境変数を読み込む
	if err := env.Parse(&config.Conf); err != nil {
		panic(err)
	}

    // ログ出力の設定。slogパッケージを使用
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

    // データベース接続の初期化
	database, err := db.Init()
	if err != nil {
		panic(err)
	}
	dbUtil := db.NewDBUtil(database)

    // ルーターの設定
	r := router.SetupRoutes(dbUtil)

    // サーバーの起動
	if err := http.ListenAndServe(":80", r); err != nil {
		panic(err)
	}
}
```

### main関数の処理フローについて
このmain関数で行っていることは以下です。
1. **環境変数の読み込み**: `env.Parse()`により、環境変数を構造体にマッピングし、configパッケージ経由で環境変数を使用できるようにします。

2. **ログシステムの初期化**: 構造化ログを出力するため、log/slogパッケージを使ってJSON形式のログハンドラーを設定します。

3. **データベース接続**: データベース接続を確立します。

4. **ルーター設定**: リクエストを適切なハンドラーに振り分けるルーターを構築します。

5. **サーバー起動**: 指定されたポート（80番）でサーバーを起動し、リクエストの受付を開始します。

まとめると、アプリケーションの起動に必要な設定を行い、実際にサーバーを起動する処理をここに書いています。

## ルーティング設計
続いてはルーティングです。ルーティングのメイン実装は./adapter/api/router/router.goファイルに書いてあります。

```go:./adapter/api/router/router.go
package router

import (
	// 略
)

func SetupRoutes(dbutil db.DBUtils) *chi.Mux {
  // ルーターを作成
  r := chi.NewRouter()
	r.Group(func(r chi.Router) {
		r.Use(middleware.Logger)
		setupUserRoutes(r, dbutil)
		setupPostRoutes(r, dbutil)
	})

	return r
}

// user関連のルーティング設定
func setupUserRoutes(r chi.Router, dbutil db.DBUtils) {
	userUseCase := usecase.NewUserUseCase(
		database.NewUserRepository(dbutil),
	)
    // 各エンドポイントを定義し、handlerと紐付け
	handler := api.NewUserApi(userUseCase)
	r.Get("/users/{id}", handler.Fetch)
	r.Get("/users/{id}/posts", handler.FetchWithPosts)
	r.Post("/users", handler.Create)
	r.Put("/users/{id}", handler.Update)
	r.Delete("/users/{id}", handler.Delete)
}

// post関連のルーティング設定
func setupPostRoutes(r chi.Router, dbutil db.DBUtils) {
	postUseCase := usecase.NewPostUseCase(
		database.NewPostRepository(dbutil),
	)
	handler := api.NewPostApi(postUseCase)
	r.Get("/posts/users/{user_id}", handler.FetchByUserID)
	r.Get("/posts/users/{user_id}/comments", handler.FetchByUserIDWithComments)
}
```

ここではルーターを作成し、それを元にエンドポイントを定義してhandlerと紐づけています。パスが動的になる部分は{}で囲むことでパラメータとして受け取ることができます。handlerのコードは以下のようになっています。

## ハンドラー層の実装
```go:./adapter/api/user.go
package api

import (
	// 略
)

type UserApi struct {
	uc usecase.UserUseCase
}

func NewUserApi(uc usecase.UserUseCase) *UserApi {
	return &UserApi{uc: uc}
}

func (a *UserApi) Fetch(w http.ResponseWriter, r *http.Request) {
    // URLに含まれるidを取得
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
        // エラーが発生した場合はログ出力とエラーレスポンスの返却を行う
		slog.ErrorContext(r.Context(), "Invalid user ID", "id", chi.URLParam(r, "id"), "error", err.Error())
		WriteJSON(w, http.StatusBadRequest, ErrInvalidRequest)
		return
	}
    // idを元にuser情報を取得するビジネスロジックを呼び出し
	u, err := a.uc.Fetch(r.Context(), id)
	if err != nil {
		slog.ErrorContext(r.Context(), "Failed to fetch user", "id", chi.URLParam(r, "id"), "error", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ErrFailedToFetch)
		return
	}
	WriteJSON(w, http.StatusOK, u)
}

// 略
```

### ハンドラー層の責務
handler層の役割はAPIへのリクエストとアプリケーション内部のビジネスロジック（UseCase）の紐付けです。また、URLパラメータやリクエストボディの形式を検証し、型安全な値にパースするなどして入力検証も行います。エラー発生時にはクライアントには適切なHTTPステータスコードとレスポンスメッセージを返し、エラーの詳細はログに出力するようにしています。

## ビジネスロジック層（UseCase）
続いてはUseCase層、いわゆるビジネスロジックの実装についてです。

```go:./usecase/user.go
package usecase

import (
	"context"

	"github.com/yuita-yoshihiko/go-sample-api/models"
	"github.com/yuita-yoshihiko/go-sample-api/usecase/repository"
)

type UserUseCase interface {
	Fetch(context.Context, int64) (*models.User, error)
	FetchWithPosts(context.Context, int64) (*models.UserWithPosts, error)
	Create(context.Context, *models.User) error
	Update(context.Context, *models.User) error
	Delete(context.Context, int64) error
}

type userUseCaseImpl struct {
	repository repository.UserRepository
}

func NewUserUseCase(
	r repository.UserRepository,
) UserUseCase {
	return &userUseCaseImpl{
		repository: r,
	}
}

func (u *userUseCaseImpl) Fetch(ctx context.Context, id int64) (*models.User, error) {
    // repository層のコードを呼び出す。
	return u.repository.Fetch(ctx, id)
}
// 略
```

今回の実装では簡単な処理しか書いていないので、usecase層のコードはrepository層（DBとのインターフェース）のコードを呼び出すだけになっていますが、実際にはUseCase層はメインとなるロジックを実装するところなので、この層で複雑な処理が行われることもよくあります。

### UseCase層で実装される複雑な処理例
- **ビジネスルールの検証**（例：ユーザーの削除可否判定）
- **トランザクション**（例：複数テーブルのデータ操作）
- **外部システム連携**（例：メール送信やプッシュ通知）

ではusecase層で呼び出しているrepository層のコードを見ていきましょう。

## データアクセス層（Repository）
```go:./adapter/database/user.go
package database

import (
	"context"
	"database/sql"

	"github.com/yuita-yoshihiko/go-sample-api/infrastructure/db"
	"github.com/yuita-yoshihiko/go-sample-api/models"
	"github.com/yuita-yoshihiko/go-sample-api/usecase/repository"
)

type userRepositoryImpl struct {
	db db.DBUtils
}

func NewUserRepository(db db.DBUtils) repository.UserRepository {
	return &userRepositoryImpl{db: db}
}

// idを元にuser情報を取得する処理
func (r *userRepositoryImpl) Fetch(ctx context.Context, id int64) (*models.User, error) {
	const query = "SELECT * FROM users WHERE id = $1"
	var user models.User
	if err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &user, nil
}

// 略
```

### Repository層の詳細な責務
この層ではデータベースに対してSQLクエリを実行し、返却されたデータをGoの構造体にマッピングしています。repository層を使ってデータ操作をビジネスロジックから分離することで、**テスタビリティ**と**保守性**を向上させています。

## 処理フローの全体像
ここまで見たように、APIにリクエストがあった際は以下のように処理が流れていきます。

**router → handler → usecase → repository**

### 各層の相互作用

1. **Router**: HTTPリクエストを受信し、適切なHandlerに振り分け
2. **Handler**: HTTPの処理とUseCaseの呼び出し
3. **UseCase**: ビジネスロジックの実行とRepositoryの呼び出し
4. **Repository**: データベースアクセスとデータの永続化

このような層になったアーキテクチャにすると、適切に処理の責務を分離しやすくなり、各層のテストや変更の影響範囲の特定がしやすくなります。

## テスト戦略
続いてテストについてです。Goではテストフレームワークなどは使わず、テストもGoで書くことがほとんどです。今回はrepository層のテストを書いています。DockerでテストDBを立ち上げ、そこにデータを流し込んでテストする方式を取っています。

```go
/*
テストデータのyml
- id: 1
  name: "テストユーザー1"
  email: "user1@example.com"
  created_at: "2025-01-01T00:00:00Z"
  updated_at: "2025-01-01T00:00:00Z"
*/
package database_test

import (
	// 略
)

func Test_User_Fetch(t *testing.T) {
	data := testutils.LoadFixture(t, "testfixtures/users/fetch")
	dbUtils := db.NewDBUtil(data)
	r := database.NewUserRepository(dbUtils)

	type args struct {
		id int64
	}

	tests := []struct {
		name string
		args args
		want *models.User
	}{
		{
			name: "idで抽出した単一のユーザーのデータが取得できる",
			args: args{
				id: 1,
			},
			want: &models.User{
				ID:        1,
				Name:      "テストユーザー1",
				Email:     "user1@example.com",
				CreatedAt: time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
				UpdatedAt: time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := r.Fetch(tt.args.id)
			if err != nil {
				t.Errorf("error = %v", err)
			}
			testutils.AssertResponse(t, got, tt.want)
		})
	}
}
```

### テスト設計の考慮点
**テストデータ管理**
`go-testfixtures/testfixtures`というパッケージを使い、ymlで定義したテストデータをDBに流し込んで、それを元にテストを実行しています。これにより、**再現可能**で**独立した**テストが実現できます。

**テーブル駆動テスト**
Goでよく採用される**テーブル駆動テスト**を実装しています。テーブル駆動テストとはテストケースをスライスや配列などを使ってテーブル形式で表現し、それをループで回してテストを実行するテストパターンのことです。テーブル駆動テストには、テストコードの可読性を高めることや、新しいテストケースを簡単に追加できること、同じテストロジックの繰り返しを避けることができるなど様々なメリットがあります。

テーブル駆動テストについては上の例だとテストケースが一つしかないのでイメージが付きにくいと思うので以下にサンプルを示します。

- テスト対象関数
```go
// 引数にとった文字列を逆さにする関数
func ReverseString(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
```

- テストコード
```go
func TestReverseString(t *testing.T) {
    // テストケースとなる構造体のスライスを定義
    tests := []struct {
        name string // テスト名
        input string // テスト対象の値
        want string // 期待する値
    }{
        {"空文字", "", ""},
        {"1文字", "a", "a"},
        {"英語", "hello", "olleh"},
        {"日本語", "こんにちは", "はちにんこ"},
        // 他にテストしたい値があれば追加する
    }

    // テストの実行
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            got := ReverseString(tc.input)
            if got != tc.want {
                t.Errorf("反転させる文字列:%q, 期待する文字列:%q, 得られた結果:%q", tc.input, tc.want, got)
            }
        })
    }
}
```

## 開発効率化ツール
### airについて
Goはコンパイル言語なのでソースコードを変更したら再ビルドが必要です。ただ、開発中に何度もビルドし直すのは手間なのでホットリロードツールを導入して開発を進める方が効率的です。airはGoでよく使われているホットリロードツールです。ホットリロードツールを導入することで、コードを変更した後に自動で再ビルドを行ってくれるので効率的に開発を進めることができるようになります。

**airの詳細な動作**:
- **ファイル監視**: 指定された拡張子のファイル変更を監視
- **自動ビルド**: 変更検知時に自動的に`go build`を実行
- **プロセス管理**: 既存のプロセスを適切に終了し、新しいバイナリで再起動
- **エラーハンドリング**: ビルドエラー時も監視を継続し、修正を待機

**開発ワークフローの改善**:
- 従来：`コード変更 → Ctrl+C → go build → go run → 確認`
- air使用時：`コード変更 → 自動再起動 → 即座に確認`

このように、コード修正時に自動で再ビルドを走らせることで開発効率を向上させることができます。

### log/slogについて
log/slogパッケージはGo1.21で導入された構造化されたログ出力用の標準パッケージです。log/slogパッケージが導入されるまでは構造化ログを出力するためにはサードパーティパッケージを使うなり自前で実装するなりする必要がありました。log/slogパッケージ導入後は標準パッケージであるlog/slogパッケージだけで構造化ログを出力できるようになったので、積極的に使っていきましょう。

**構造化ログの利点**:
- **検索性**: JSON形式により、ログ集約システムでの検索が容易
- **パース可能性**: 機械的な処理に適した形式
- **メタデータ**: リクエストID、ユーザーID等の文脈情報を含められる
- **レベル管理**: ERROR、WARN、INFO等のレベル別フィルタリング

### database/sqlについて
本書ではDB操作に標準パッケージの`database/sql`パッケージを使用しています。`database/sql`パッケージは標準パッケージのため依存関係などを考えずに使用できますが、機能が少なくコード量が多くなりがちです。そのため以下のようなパッケージを使うのもおすすめです。

#### 各ツールの特徴と使い分け
- **sqlx**
    - https://github.com/jmoiron/sqlx
    - `database/sql`パッケージの薄いラッパー。構造体とのマッピングなどが楽にできる。
    - **特徴**: 学習コストが低く、移行が容易。標準SQLをそのまま使用可能
    - **適用場面**: 既存のdatabase/sqlからの移行、極力薄いパッケージを使いたい場合

- **sqlc**
    - https://github.com/sqlc-dev/sqlc
    - SQLから型安全なGoコードを生成できる。
    - **特徴**: コンパイル時に型安全性を保証、SQLファーストのアプローチ
    - **適用場面**: 型安全性を重視する場合

- **GORM**
    - https://github.com/go-gorm/gorm
    - ActiveRecordのようなオールインワンのORM。
    - **特徴**: 豊富な機能、自動マイグレーション、リレーション管理
    - **適用場面**: 開発スピードを上げたい、ORM経験のあるチーム

## まとめ
本書では、GoによるAPI開発の基本的な内容を解説しました。Goはシンプルですが奥が深く、とても面白い言語だと思うのでぜひ触ってみてください。読者の方がGoに興味を持ってくれるきっかけになれば幸いです。
