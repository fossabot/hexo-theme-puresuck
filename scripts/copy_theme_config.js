// 复制主题配置文件
const fs = require('fs');
const path = require('path');

const theme_config_path = path.join(hexo.theme_dir, '_config.yml');
const blog_config_path = path.join(hexo.base_dir, '_config.puresuck.yml');

// 复制主题配置文件到博客根目录

function copy_theme_config() {
    fs.readFile(theme_config_path, 'utf8', (err, data) => {
        if (err) {
            hexo.log.error('读取主题配置文件失败:', err);
            return;
        }

        fs.writeFile(blog_config_path, data, (err) => {
            if (err) {
                hexo.log.error('写入博客配置文件失败:', err);
                return;
            }
            hexo.log.info('主题配置文件已复制到博客根目录');
        });
    });
}

hexo.extend.console.register(
  "copy_theme_config",
  "复制主题配置文件",
  function (args) {
    copy_theme_config();
  },
);