"use strict";

const theme = hexo.theme.context.config

var import_html = theme["import"] || {
  head_begin: null,
  head_end: null,
  body_begin: null,
  body_end: null
};

if (import_html.head_begin) {
  // 拼接字符串
  var str;

  for (i in import_html.head_begin) {
    str += import_html.head_begin[i];
  }

  hexo.extend.injector.register("head_begin", function () {
    return str;
  });
}

if (import_html.body_end) {
  // 拼接字符串
  var _str;

  for (i in import_html.body_end) {
    _str += import_html.body_end[i];
  }

  hexo.extend.injector.register("body_end", function () {
    return _str;
  });
}

if (import_html.body_begin) {
  // 拼接字符串
  var _str2;

  for (i in import_html.body_begin) {
    _str2 += import_html.body_begin[i];
  }

  hexo.extend.injector.register("body_begin", function () {
    return _str2;
  });
}

if (import_html.head_end) {
  // 拼接字符串
  var _str3;

  for (i in import_html.head_end) {
    _str3 += import_html.head_end[i];
  }

  hexo.extend.injector.register("head_end", function () {
    return _str3;
  });
}