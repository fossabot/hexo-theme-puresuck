const fs = require('fs');
const path = require('path')

// 读取当前主题的 package.json 文件

const version = JSON.parse(fs.readFileSync(path.join(hexo.theme_dir, '/package.json'), 'utf8'));
const theme_version = version.version;

// 读取主题 cdn 配置
const theme_cdn_config = hexo.theme.context.config.theme_config.cdn_system;

// 读取 cdn 配置
const cdn_config = hexo.render.renderSync({ path: path.join(hexo.theme_dir, '/_cdn.yml'), engine: 'yaml' })

// 获取 cdn 链接
// 用法 get_cdn_url('hexo-theme-puresuck-PureSuck_Style') return https://registry.npmmirror.com/hexo-theme-puresuck/source/css/PureSuck_Style.css
// function get_cdn_url(asset_name) {
//     priority = theme_cdn_config.priority;

// }


// 合并主题配置和默认配置

system_config = Object.assign({}, cdn_config.system_config, theme_cdn_config.system_config);
all_assets = Object.assign({}, cdn_config.assets, theme_cdn_config.assets);


function get_cdn_url(asset_name) {
    const priority = theme_cdn_config.priority;
    const asset = all_assets[asset_name];

    // 1. 处理资源不存在的情况
    if (!asset) {
        hexo.log.error(`Asset ${asset_name} not found in _cdn.yml`);
        return '';
    }

    // 2. 处理版本号中的变量
    const version = asset.version.replace(/\$\{theme_version\}/g, theme_version);

    // 2.5. 处理资源的permalink
    if (asset.permalink) {
        return asset.permalink.replace(/\$\{theme_version\}/g, theme_version);
    }


    // 3. 按优先级遍历CDN系统
    for (const cdn_name of priority) {
        const cdn_system = system_config[cdn_name];
        if (!cdn_system) continue;

        // 4. 检查CDN支持的平台与资源平台的交集
        const supported_platforms = asset.platform.filter(p => 
            cdn_system.platform.includes(p)
        );

        if (supported_platforms.length > 0) {
            const platform = supported_platforms[0]; // 取第一个支持的平台
            let path_template = '';

            // 5. 根据平台类型选择路径模板
            if (platform === 'npm' && cdn_system.npm_path) {
                path_template = cdn_system.npm_path;
            } else if (platform === 'github' && cdn_system.github_path) {
                path_template = cdn_system.github_path;
            }

            if (path_template) {
                // 6. 替换路径模板中的变量
                let result_path = path_template
                    .replace(/\$\{package\}/g, asset.package)
                    .replace(/\$\{version\}/g, version)
                    .replace(/\$\{filepath\}/g, asset.filepath)
                    .replace(/\$\{user\}/g, asset.user || '')
                    .replace(/\$\{repo\}/g, asset.repo || '');

                // 7. 构建完整URL
                return `${cdn_system.protocol}://${cdn_system.host}/${result_path}`;
            }
        }
    }

    // 8. 回退机制：本地路径 > 备用URL
    if (asset.localpath && asset.localpath.trim() !== '') {
        try {
            const url_for = hexo.extend.helper.get('url_for').bind(hexo);
            return url_for(asset.localpath);
        } catch (e) {
            hexo.log.warn(`url_for helper not available, using raw localpath`);
            return asset.localpath;
        }
    }

    // 9. 最终回退到备用URL
    return asset.secondary_url.replace(/\$\{theme_version\}/g, theme_version);
}

// console.log(get_cdn_url('hexo-theme-puresuck-PureSuck_Style'));
// console.log(get_cdn_url('twikoo.min.js'));


// 注册 get_cdn_url 辅助函数
hexo.extend.helper.register("get_cdn_url", get_cdn_url);



// 测试 cdn 链接是否可用
// 需要安装 axios
// npm install axios
function test_cdn() {
    let all_asset_name_array = [];
    let all_asset_name_array_url = [];
    for (const asset_name of Object.keys(all_assets)) {
        all_asset_name_array.push(asset_name);
        all_asset_name_array_url.push(get_cdn_url(asset_name));
    }

    const axios = require('axios');
    const testUrls = all_asset_name_array_url;

    /**
     * 测试单个链接是否返回 200 状态码
     * @param {string} url - 待测试的链接
     */
    function testSingleUrl(url) {
        // 返回 Promise 对象
        return axios.get(url, { timeout: 5000 })
            .then(response => {
                if (response.status === 200) {
                    console.log(`✅ [成功] ${url} - 状态码: ${response.status}`);
                } else {
                    console.log(`❌ [失败] ${url} - 状态码: ${response.status} (非 200)`);
                }
            })
            .catch(error => {
                let errorMsg = '未知错误';
                if (error.response) {
                    errorMsg = `状态码: ${error.response.status}`;
                } else if (error.request) {
                    errorMsg = '未收到响应（可能超时或网络问题）';
                } else {
                    errorMsg = error.message;
                }
                console.log(`❌ [失败] ${url} - 原因: ${errorMsg}`);
            });
    }

    /**
     * 批量测试所有链接（使用 Promise 链式调用）
     */
    function testAllUrls() {
        console.log('开始测试链接...\n');
        
        // 初始 Promise
        let promiseChain = Promise.resolve();
        
        // 逐个添加测试到 Promise 链
        testUrls.forEach(url => {
            promiseChain = promiseChain.then(() => testSingleUrl(url));
        });
        
        // 所有测试完成后
        promiseChain.then(() => {
            console.log('\n测试完成');
        });
    }

    // 执行测试
    testAllUrls();
}

hexo.extend.console.register(
  "testcdn",
  "Test cdn",
  function (args) {
    test_cdn();
  },
);
