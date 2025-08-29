
const search_db_path = "{{search_db_path}}"


const xhr = new XMLHttpRequest();
xhr.open('GET', search_db_path, false); // 同步请求
xhr.send();

if (!(xhr.status > 199) && !(xhr.status < 400)) {
    console.error('搜索数据库加载失败:', xhr.status, xhr.statusText);
    throw new Error('搜索数据库加载失败');
}


const search_db = JSON.parse(xhr.responseText);

const posts = search_db.posts || {};
const max_results = search_db.config?.maxResults || 10;
const author = search_db.config?.author || "Unknown";
const html_not_found_template = search_db.config?.html_not_found_template
    .replace(/{{Zai_Cry}}/g, "{{Zai_Cry.png}}")

// 模糊搜索文章内容，按相关性评分返回前10个结果
function fuzzySearchPosts(posts, searchTerm, max_results = 10) {
    if (!searchTerm || !searchTerm.trim()) return [];
    console.log('searchTerm', searchTerm);

    // 修复：修改正则表达式保留中文字符
    const normalize = str => str.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5]/gu, '');
    const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);

    if (keywords.length === 0) return [];

    const results = [];

    posts.forEach(post => {
        let score = 0;
        let matchPositions = [];

        const fields = [
            { text: post.title, weight: 5 },
            { text: post.tags?.map(t => t.name).join(' ') || '', weight: 3 },
            { text: post.categories?.join(' ') || '', weight: 2 },
            { text: post.content, weight: 1 }
        ];

        keywords.forEach(keyword => {
            fields.forEach(field => {
                const fieldText = normalize(field.text);
                const index = fieldText.indexOf(keyword);

                if (index >= 0) {
                    const keywordRatio = keyword.length / Math.max(1, fieldText.length);
                    score += field.weight * keywordRatio;
                    matchPositions.push({
                        start: index,
                        end: index + keyword.length,
                        weight: field.weight
                    });
                }
            });
        });

        const sortedPositions = matchPositions.sort((a, b) => a.start - b.start);
        for (let i = 1; i < sortedPositions.length; i++) {
            const prevEnd = sortedPositions[i - 1].end;
            const currStart = sortedPositions[i].start;
            if (currStart < prevEnd + 10) {
                score += 0.5 * Math.max(sortedPositions[i].weight, sortedPositions[i - 1].weight);
            }
        }

        if (normalize(post.title).includes(normalize(searchTerm))) {
            score += 8;
        }

        if (score > 0) {
            results.push({
                ...post,
                score: parseFloat(score.toFixed(2)),
                highlight: matchPositions[0]
            });
        }
    });

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, max_results);
}

// 使用示例：
// const searchResults = fuzzySearchPosts(posts, "PureSuck Theme");



/**
 * 渲染 item
 * @param {object} item - 文章对象
 * @param {string} item.title - 文章标题
 * @param {string} item.date - 文章日期
 * @param {string} item.path - 文章路径
 * @param {string} item.content - 文章内容
 * @returns {string} - HTML 字符串
 */
function renderItem(item) {

    let template = search_db.config.html_item_template
        .replace(/{{title}}/g, item.title)
        .replace(/{{date}}/g, item.date)
        .replace(/{{path}}/g, item.path)
        .replace(/{{content}}/g, item.content)
        .replace(/{{postavatar}}/g, search_db.config.postavatar)
        .replace(/{{postavatar}}/g, search_db.config.postavatar)
        .replace(/{{author}}/g, author);
    return template;
}


function renderItemHtml(searchResults) {
    let html_result = searchResults.map(item => renderItem(item)).join("\n");
    return html_result;
}

function renderPage(keyword,searchResults) {
    const a = document.querySelector('body > div.wrapper > main > div.wrapper')
    const b = document.querySelector('body > div.wrapper > main > nav')
    const c = `<h3 class="archive-title">包含关键字 ${keyword} 的文章</h3>`

    if (a) {
        if (searchResults.length === 0) {
            a.innerHTML = c + html_not_found_template;
        } else {
            a.innerHTML = c + renderItemHtml(searchResults);
        }
        console.log('searchResults', searchResults.length);
    }

    if (b) {
        b.innerHTML = '<span class="nav-item-alt">第 1 页 / 共 0 页</span><div class="nav nav--pager"><i class="icon-record-outline"></i></div>';
    }
    AOS.refresh()
}

function search(keyword) {
    if (!keyword || !keyword.trim()) {
        MoxToast({
                    message: "请输入搜索关键词"
        });
        return;
    }
    const searchResults = fuzzySearchPosts(posts, String(keyword));
    renderPage(keyword,searchResults);
}

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.querySelector('#right-sidebar > div.search-section > section > div > button');
    const searchInput = document.querySelector('#right-sidebar > div.search-section > section > div > input');
    // 绑定按钮点击事件
    searchButton.addEventListener('click', function () {
        search(searchInput.value);
    });

    // 绑定输入框回车事件
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            search(searchInput.value);
        }
    });
});

document.addEventListener("pjax:success", function(event) {
    const searchButton = document.querySelector('#right-sidebar > div.search-section > section > div > button');
    const searchInput = document.querySelector('#right-sidebar > div.search-section > section > div > input');
    // 绑定按钮点击事件
    searchButton.addEventListener('click', function () {
        search(searchInput.value);
    });

    // 绑定输入框回车事件
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            search(searchInput.value);
        }
    });
});