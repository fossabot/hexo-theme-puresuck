hexo.extend.helper.register('mybugger', function (i) {
  console.log('hello world');
  debugger;
  // console.log(hexo);
  // console.log(config);
  // console.log(theme);
  // console.log(page);
  // console.log(post);


});
// use
// <%= mybugger(hexo, config, theme, page) %>