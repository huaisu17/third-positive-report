# 第三份阳性报告

高中校园网页搜索解谜游戏，完整篇。人物、报告与剧情账号均为虚构。

十二章故事、23篇论坛主题、三个人物账号、报告比对、时间线与证据链，以及五组宿舍彩蛋。

## 本地运行

```sh
python3 -m http.server 4173 --directory dist
```

打开 http://localhost:4173/ 。运行 `npm run check` 检查代码和游戏推进规则，无需安装依赖。

## GitHub Pages

仓库建议为 `huaisu17/third-positive-report`，发布源选择 GitHub Actions。
工作流仅发布 `dist/`，每次向 `main` 推送都会先检查游戏，再发布。
游戏链接在 Actions 的成功部署记录中提供。

GitHub项目子目录可直接使用，页面、脚本、图片均采用相对路径，剧情页面使用hash路由。
进度保存在当前网站域名的浏览器中，原Sites域名的进度不会自动迁移到GitHub Pages。

源码里没有真实账号密码或服务端密钥；登录口令属于虚构剧情，不连接第三方账户。
