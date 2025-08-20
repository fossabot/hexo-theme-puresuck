const fs = require('fs');
const path = require('path')
const axios = require('axios');

// 读取当前主题的 package.json 文件

const version = JSON.parse(fs.readFileSync(path.join(hexo.theme_dir, '/package.json'), 'utf8'));
const theme_version = version.version;

// 读取主题 cdn 配置
const theme_cdn_config = hexo.theme.context.config.theme_config.cdn_system;

// 读取 cdn 配置
const cdn_config = hexo.render.renderSync({ path: path.join(hexo.theme_dir, '/_cdn.yml'), engine: 'yaml' })



/**
 * 合并两个assets数组，相同name的对象由后者覆盖前者
 * 
 * 使用示例
 * const all_assets = mergeAssets(cdn_config.assets, theme_cdn_config.assets);
 * @param {Array} assets1 - 初始数组（如cdn_config.assets）
 * @param {Array} assets2 - 覆盖数组（如theme_cdn_config.assets）
 * @returns {Array} 合并后的新数组
 */
function mergeAssets(assets1, assets2) {

    // 0. 处理空数组情况
    if(!assets1 && !assets2) return [];
    if(!assets1) return assets2;
    if(!assets2) return assets1;

    // 1. 创建Map存储键值对，以name为唯一键
    const map = new Map();
    
    // 2. 遍历第一个数组，填充Map
    assets1.forEach(item => {
        if (item.name) map.set(item.name, item);
    });
    
    // 3. 遍历第二个数组，覆盖同名对象
    assets2.forEach(item => {
        if (item.name) map.set(item.name, item); // 相同name时覆盖
    });
    
    // 4. 返回合并后的数组
    return Array.from(map.values());
}


// 合并主题配置和默认配置

const system_config = Object.assign({}, cdn_config.system_config, theme_cdn_config.system_config);
const all_assets = mergeAssets(cdn_config.assets, theme_cdn_config.assets);


/**
 * 在对象数组中根据name查找对应的对象
 * @param {string} name - 要查找的对象name属性值
 * @param {Array} list - 对象数组
 * @returns {Object|null} 匹配到的对象，未找到返回null
 */
function findObjectByName(name, list) {
    return list.find(item => item.name === name) || null;
}

/**
 * 获取资源的cdn链接
 * @param {string} asset_name - 资源名称
 * @returns {string} 资源的cdn链接
 */
function get_cdn_url(asset_name) {
    const priority = theme_cdn_config.priority || [];
    const asset = findObjectByName(asset_name, all_assets);

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
        // hexo.log.info(`Checking ${cdn_name} for ${asset_name}`);
        if (!cdn_system) {
            // hexo.log.error(`CDN system ${cdn_name} not found in _cdn.yml`);
            // debugger
            continue;
        }

        // 4. 检查CDN支持的平台与资源平台的交集
        const supported_platforms = asset.platform.filter(p => 
            cdn_system.platform.includes(p)
        );

        if (supported_platforms.length > 0) {
            for (const platform of supported_platforms) {

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

// console.log(get_cdn_url('MoxDesign.css'));
// console.log(get_cdn_url('PureSuck_Style.css'));


// 注册 get_cdn_url 辅助函数
hexo.extend.helper.register("get_cdn_url", get_cdn_url);

/**
 * 测试所有cdn链接是否可用
 * 需要安装 axios
 * npm install axios
 */
function test_cdn() {
    let all_asset_name_array = [];
    let all_asset_name_array_url = [];
    for (const id of Object.keys(all_assets)) {
        all_asset_name_array.push(all_assets[id].name);
        all_asset_name_array_url.push(get_cdn_url(all_assets[id].name));
    }

    // const axios = require('axios');
    const testUrls = all_asset_name_array_url;
    let error_count = 0;

    /**
     * 测试单个链接是否返回 200 状态码
     * @param {string} url - 待测试的链接
     */
    function testSingleUrl(url) {
        if (url.startsWith('//') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            hexo.log.info(`✅ [成功] ${url} 是本地路径，跳过测试`);
            return Promise.resolve(); // 添加立即解决的Promise
        }
        // 返回 Promise 对象
        return axios.get(url, { timeout: 5000 })
            .then(response => {
                if (response.status === 200) {
                    hexo.log.info(`✅ [成功] ${url} - 状态码: ${response.status}`);
                } else {
                    error_count++;
                    hexo.log.error(`❌ [失败] ${url} - 状态码: ${response.status} (非 200)`);
                }
            })
            .catch(error => {
                error_count++;
                let errorMsg = '未知错误';
                if (error.response) {
                    errorMsg = `状态码: ${error.response.status}`;
                } else if (error.request) {
                    errorMsg = '未收到响应（可能超时或网络问题）';
                } else {
                    errorMsg = error.message;
                }
                hexo.log.error(`❌ [失败] ${url} - 原因: ${errorMsg}`);
            });
    }

    /**
     * 批量测试所有链接（使用 Promise 链式调用）
     */
    function testAllUrls() {
        hexo.log.info('开始测试链接...');
        hexo.log.info('资源数量：' + testUrls.length);
        // 如果没有资源，则直接返回
        if (testUrls.length === 0) {
            hexo.log.info('没有需要测试的资源链接');
            return;
        }
        // 初始 Promise
        let promiseChain = Promise.resolve();
        
        // 逐个添加测试到 Promise 链
        testUrls.forEach(url => {
            promiseChain = promiseChain.then(() => testSingleUrl(url));
        });
        
        // 所有测试完成后
        promiseChain.then(() => {
            if (error_count === 0) {
                hexo.log.info('所有链接测试完成，无错误');
            } else {
                hexo.log.warn(`所有链接测试完成，发现 ${error_count} 个错误(${error_count / testUrls.length * 100}%)`);
            }
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

hexo.extend.console.register(
  "get_cdn_url",
  "Get cdn url",
  function (args) {
    if (args._.length === 0) {
      hexo.log.error('please input asset name');
      return;
    }
    console.log(get_cdn_url(args._[0]));
  },
);