hexo.extend.helper.register('getList', function (list) {
  if (!list) return []
  if (typeof list == "string") {
    return [list]
  } else {
    return [...list]
  }
});