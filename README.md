# **Output Checker for snapper-chain-sim**

Google Code Jam の過去問「Snapper Chain」などの競技プログラミング問題において、プログラムが出力した結果ファイルと、サーバー上の模範解答ファイルを比較・検証するためのWebアプリケーションです。

## **✨ 主な機能**

* **Small / Large データセット対応**  
  * ドロップダウンから比較したいデータセットを簡単に切り替えられます。  
* **ファイルの直接読み込み**  
  * プログラムが出力したテキストファイル（.txt, .out, .in）をブラウザ上で安全に読み込んで比較します（データはサーバーに送信されません）。  
* **差分のハイライト表示**  
  * 一致している行は緑色、不一致の行は赤色で分かりやすく表示します。  
* **空白文字の可視化**  
  * 不一致の原因となりやすい「見えないスペースやタブ」を ␣ や ⇥ として視覚化し、デバッグを容易にします。  
* **柔軟な比較オプション**  
  * 「大文字小文字・余分な空白の違いを無視」するチェックボックスを搭載。フォーマットの違いを無視してロジックの正しさだけを確認したい場合に便利です。  
* **エラー行の絞り込み**  
  * 「不一致の行のみ表示する」フィルター機能により、大量の出力から間違えたケースだけを素早く特定できます。

## **🛠 技術スタック**

* **Framework:** React \+ Vite  
* **Styling:** Tailwind CSS (v4)  
* **Icons:** Lucide React  
* **Deployment:** GitHub Pages

## **🚀 ローカルでの実行方法**

手元の環境でプロジェクトを実行するには、Node.js がインストールされている必要があります。

1. **リポジトリをクローンします**  
   git clone \[https://github.com/あなたのユーザー名/codejam-checker.git\](https://github.com/あなたのユーザー名/codejam-checker.git)  
   cd codejam-checker

2. **依存パッケージをインストールします**  
   npm install

3. **開発サーバーを起動します**  
   npm run dev

4. **ブラウザでアクセスします**  
   ブラウザで http://localhost:5173/ にアクセスします。

## **📁 模範解答ファイルの配置方法**

模範解答のデータは public/answers/ フォルダ内に配置してください。

現在の設定では以下のファイルが読み込まれるようになっています。

public/  
  └── answers/  
       ├── A-small-answer.in  (Small用の模範解答)  
       └── A-large-answer.in  (Large用の模範解答)

新しい問題やデータセットを追加する場合は、src/App.jsx 内の DATASET\_LIST を編集してファイルパスを指定してください。

## **🌐 デプロイ (GitHub Pages)**

このアプリは GitHub Pages に簡単にデプロイできるよう構成されています。

npm run deploy

上記コマンドを実行すると、自動的にプロジェクトがビルドされ、gh-pages ブランチにプッシュされて公開されます。

**Note:** 事前に vite.config.js と package.json 内の URL 設定がご自身の GitHub リポジトリ名と一致していることを確認してください。

## **📝 ライセンス**

This project is open source and available under the MIT License.