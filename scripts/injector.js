"use strict";

const theme_config = hexo.theme.context.config.theme_config;


const import_html = theme_config?.import || {
  head_begin: null,
  head_end: null,
  body_begin: null,
  body_end: null
};

function tostr(data) {
  let str = '';
  if (data == null) {
    return '';
  } else if (typeof data == 'string') {
    return data;
  } else if (typeof data == 'object') {
    for (let i = 0; i < data.length; i++) {
      str += data[i];
    }
  }
  return str;
}

if (import_html.head_begin != null) {
  hexo.extend.injector.register("head_begin", () => {
    return tostr(import_html.head_begin);
  });
}
if (import_html.head_end != null) {
  hexo.extend.injector.register("head_end", () => {
    return tostr(import_html.head_end);
  });
}
if (import_html.body_begin != null) {
  hexo.extend.injector.register("body_begin", () => {
    return tostr(import_html.body_begin);
  });
}
if (import_html.body_end != null) {
  hexo.extend.injector.register("body_end", () => {
    return tostr(import_html.body_end);
  });
}
