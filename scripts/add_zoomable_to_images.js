// 图片放大
function addZoomableToImages(content) {
  // 排除规则配置
  const excludeSelectors = ['no-zoom', 'special-image'];
  
  // 匹配所有 img 标签的正则 (改进版，防止匹配 SVG 内容)
  const imgRegex = /<img\b([^>]*)>/g;
  
  return content.replace(imgRegex, (imgTag) => {
    // 检查是否需要排除
    const shouldExclude = excludeSelectors.some(selector => {
      // 检查 class 属性
      if (imgTag.includes(`class="${selector}"`)) return true;
      if (imgTag.includes(`class='${selector}'`)) return true;
      if (imgTag.includes(`class=${selector}`)) return true;
      
      // 检查 id 属性
      if (imgTag.includes(`id="${selector}"`)) return true;
      if (imgTag.includes(`id='${selector}'`)) return true;
      if (imgTag.includes(`id=${selector}`)) return true;
      
      return false;
    });

    // 检查是否已包含 data-zoomable
    const hasZoomable = /data-zoomable\b/.test(imgTag);

    // 添加属性
    if (!shouldExclude && !hasZoomable) {
      // 确保在 > 前插入属性
      if (imgTag.endsWith('/>')) {
        return imgTag.replace('/>', ' data-zoomable />');
      }
      return imgTag.replace('>', ' data-zoomable>');
    }

    return imgTag;
  });
}


hexo.extend.filter.register("after_post_render", function (data) {
  data.content = addZoomableToImages(data.content);
  return data;
});