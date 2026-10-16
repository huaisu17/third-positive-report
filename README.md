# 第三份阳性报告

校园论坛搜索解谜作品，v2.1 共十九章。原案之后可继续调查后勤材料，通过授权账号找回、时间线比对、用药与报告核对、草稿恢复、加密Excel和证据板连线走向两种结局。旧版同域浏览器存档可直接续玩。

v2.1加入经典BBS楼层、C14复印报告、随手记线索本、内网连接等待、撤回留存动效和手机快捷底栏。见 [界面改版说明](docs/UI-REFRESH.md)。

**[打开游戏](https://huaisu17.github.io/third-positive-report/)**

开发者新增流程、谜题清单及依赖验证见 [扩展设计文档](docs/EXPANSION-DESIGN.md)（含剧透，普通玩家请勿提前阅读）。运行 `npm run check` 检查全部模块与通关测试；`npm run build:archive` 可重新生成剧情加密附件。无运行依赖，不需要安装包。

人物、报告、供应商及剧情账号均为虚构。保留原作23篇论坛主题及五组宿舍彩蛋，新增沈栀的授权阅览账号与七章后续调查。

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
