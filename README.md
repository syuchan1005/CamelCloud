# CamelCloud
## これはなに？
あなたのマシン上で実行できるクラウドストレージ

### Docker

[Docker Hub](https://hub.docker.com/r/syuchan1005/camelcloud/)

```bash
docker pull syuchan1005/camelcloud
```

#### Environment

|ENV Name|default|
|:--|:--|
|PORT|80|

### インストール

#### コンフィグのコピー

```bash
$ cd ...解凍したzipのPath
$ cp template.config.js config.js
$ $(Your favorite editor) config.js
```

#### クライアントのビルド

```bash
$ cd ...解凍したzipのPath
$ cd Client
$ npm install
$ npm run build
```
#### サーバーのビルド

```bash
$ cd ...解凍したzipのPath
$ cd Server
$ npm install
$ npm run build
```

### 起動

```bash
$ cd ...解凍したzipのPath
$ cd Server
$ npm start
```
