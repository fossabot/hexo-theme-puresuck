const fs = require('fs');
const path = require('path')

const theme_version = JSON.parse(fs.readFileSync(path.join(hexo.theme_dir, '/package.json'), 'utf8')).version;

hexo.on('ready', () => {
  hexo.log.info(`
============================================================
  PureSuck Theme ${theme_version}
  Repo: https://github.com/God-2077/hexo-theme-puresuck/
============================================================`);
});