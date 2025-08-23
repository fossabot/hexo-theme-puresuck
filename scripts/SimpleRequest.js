const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/**
 * 简单请求
 * @param {string} url - 请求URL
 * @param {string} [method='GET'] - 请求方法，如GET、POST、HEAD等
 * @param {Object} options - 选项对象
 * @param {boolean} [options.async=false] - 是否异步请求，默认同步
 * @param {Object} [options.data=null] - 请求数据，GET请求时为null
 * @param {Object} [options.headers={}] - 请求头，如{'Content-Type': 'application/json'}
 * @param {number} [options.timeout=10000] - 超时时间，单位毫秒，默认10000ms
 * @param {string} [options.responseType=null] - 响应类型，如'text'、'json'、'document'等，默认'text'
 * @param {string} [options.user=null] - 用户名，可选
 * @param {string} [options.password=null] - 密码，可选
 * @param {function} [options.onload=null] - 加载完成回调，可选
 * @param {function} [options.onerror=null] - 错误回调，可选
 * @param {function} [options.ontimeout=null] - 超时回调，可选
 * @returns {Object} - 包含请求结果的对象
 * @example
 * SimpleRequest('https://cn.bing.com/', 'GET', {
 *     async: false,
 *     onload: function (xhr) {
 *         console.log(xhr.responseText);
 *     },
 *     onerror: function (xhr) {
 *         console.log(xhr.statusText);
 *     },
 *     ontimeout: function (xhr) {
 *         console.log('timeout');
 *     }
 * });
 */
function SimpleRequest(method, url, {
        async = false,
        data = null,
        headers = {},
        timeout = 10000,
        responseType = null,
        user = null,
        password = null,
        onload = null,
        onerror = null,
        ontimeout = null
    } = {}) {

    try {

        // 创建XMLHttpRequest对象
        const xhr = new XMLHttpRequest();

        //检查参数
        const methods = ['GET', 'POST', 'HEAD', 'OPTIONS', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];
        method = method.toUpperCase();
        if (!methods.includes(method)) {  
            throw new Error('method error');
        }
        
        // 初始化请求，第三个参数false表示同步请求
        xhr.open(method, url, async, user, password);

        // 设置超时时间
        if (async){
            xhr.timeout = timeout;
            // 超时回调
            xhr.ontimeout = ontimeout;
        }

        // 设置响应类型
        xhr.responseType = responseType;

        // 回调
        xhr.onload = onload;
        xhr.onerror = onerror;
        
        // 设置请求头
        Object.keys(headers).forEach(header => {
            xhr.setRequestHeader(header, headers[header]);
        });
        
        // 如果没有设置Content-Type且有数据，自动设置
        if (data && !headers['Content-Type']) {
            if (url.includes('json')) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            } else if (url.includes('xml')) {
                xhr.setRequestHeader('Content-Type', 'text/xml');
            } else if (url.includes('html')) {
                xhr.setRequestHeader('Content-Type', 'text/html');
            } else if (url.includes('js')) {
                xhr.setRequestHeader('Content-Type', 'application/javascript');
            } else if (url.includes('css')) {
                xhr.setRequestHeader('Content-Type', 'text/css');
            } else if (url.includes('form')) {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }
        // 发送请求
        xhr.send(data ? data : null);
        
        xhr.success = true;

        if (async){

            xhr.message = 'async';

            xhr.ok = undefined;

        } else {

            xhr.message = 'success';

            if (xhr.status >= 200 && xhr.status < 300) {
                xhr.ok = true;
            } else {
                xhr.ok = false;
            }
        }
        
        return xhr
    } catch (error) {
        // 捕获请求过程中的错误
        return {
            success: false,
            ok: false,
            message: error.stack,
            response: null,
            responseText: null,
            responseType: null,
            responseURL: url,
            responseXML: null,
            status: 0,
            statusText: null,
        };
    }
}

// 使用示例：
// HEAD请求
// console.log('start');
// const getResult = SimpleRequest('HEAD','https://cn.bing.com/');
// console.log(JSON.stringify(getResult));
// console.log('end');


module.exports = SimpleRequest;