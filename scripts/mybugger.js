hexo.extend.helper.register('mybugger', function (hexo, config, theme, page) {
  console.log('hello world');
});
// use
// <%= mybugger(hexo, config, theme, page) %>