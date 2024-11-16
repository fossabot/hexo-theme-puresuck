## ToDo

- [X] pjax 挂了
- [ ] 短代码解析
- [X] 代码高亮
- [ ] 删除多余代码
- [ ] 寻找并解决超多 Bug，😭😭😭
- [x] 标题，元信息的代码重写
- [x] 归档页面不能放在 `archives/index.md`，~~Hexo 它会自己找模板生成~~
- [ ] 图片放大功能失效，原因未知
- [x] 文章页尾版权信息条件判断错误

## Notes

config.yml 必须把 syntax_highlighter 设为空值或关闭 highlight.enable

```bash
npm version major 结果0.0.1->1.0.0
npm version minor 结果0.0.1->0.1.0
npm version patch 结果0.0.1->0.0.2
npm version prerelease 结果0.0.1 -> 0.0.2-0
npm version prerelease --preid=beta  结果0.0.1->0.0.2-beta.0
npm version prerelease 0.0.2-beta.0  结果0.0.1->0.0.2-beta.0
```