// 搜索
const fs = require("hexo-fs");
const path = require("path");

const url_for = hexo.extend.helper.get("url_for").bind(hexo);
const truncate = hexo.extend.helper.get("truncate").bind(hexo);
const strip_html = hexo.extend.helper.get("strip_html").bind(hexo);
const trim = hexo.extend.helper.get("trim").bind(hexo);


const theme_config = hexo.theme.context.config.theme_config;
const search_config = theme_config.search;
const searchField = search_config.field;
const contentEnable = search_config.content.enable;
const contentMaxLength = search_config.content.maxLength;
const maxResults = search_config.maxResults;
const search_db_path = "search_db.json"

function getContent(text) {
  if (contentEnable) {
    return truncate(trim(strip_html(text)).replace(/\n/g, ' '),{length: contentMaxLength, omission: ''});
  }
  return '';
}

if (!search_config.enable) {
  return;
}

// 生成搜索数据库
hexo.extend.generator.register('content_json', function(locals) {
  const config = hexo.config;
  const posts = locals.posts.toArray();
  const pages = locals.pages.toArray();
  let items = [];
  if (searchField === 'post') {
    items = posts;
  } else if (searchField === 'page') {
    items = pages;
  } else if (searchField === 'all') {
    items = posts.concat(pages);
  }
  const data = {
    config: {
        maxResults: maxResults,

        html_item_template: fs.readFileSync(path.join(hexo.theme_dir, "source/js/search_html_item_template.html")),

        html_not_found_template: fs.readFileSync(path.join(hexo.theme_dir, "source/js/search_html_not_found_template.html")),
        postavatar: theme_config.authorAvatarPath ? theme_config.authorAvatarPath : url_for('images/avatar.png'),
        author: hexo.config.author,
    },
    site: {
      title: config.title,
      subtitle: config.subtitle,
      description: config.description,
      author: config.author,
      url: config.url
    },
    posts: []
  };

  // 处理每篇文章
  items.forEach(post => {
    const tags = post.tags.map(tag => {
      return {
        name: tag.name,
        slug: tag.slug,
        path: tag.path
      };
    });

    const categories = post.categories.map(cat => {
      return {
        name: cat.name,
        slug: cat.slug,
        path: cat.path
      };
    });

    data.posts.push({
      title: post.title,
      slug: post.slug,
      date: post.date.format('YYYY-MM-DD HH:mm:ss'),
      updated: post.updated ? post.updated.format('YYYY-MM-DD HH:mm:ss') : null,
      tags: tags,
      categories: categories,
      path: url_for(post.path),
      content: getContent(post.content)
    });
  });

  // 按日期排序
  data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    path: search_db_path,
    data: JSON.stringify(data, null, 0)
  };
});


// 生成搜索脚本
const source_search_js = fs.readFileSync(path.join(hexo.theme_dir, "source/js/search_raw.js"))
    .replace(/{{search_db_path}}/g, url_for(search_db_path))
    .replace(/{{Zai_Cry.png}}/g, url_for('images/Zai_Cry.png'))

hexo.extend.generator.register("search", function (locals) {
    return {
        path: "js/search.js",
        data: source_search_js
    };
});