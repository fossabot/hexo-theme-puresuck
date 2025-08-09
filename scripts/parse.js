// 主入口函数：替换所有短代码和自定义内容
function parseShortcodes(content) {
    content = parsePicGrid(content)
    content = parseTimeline(content)
    content = parseWindows(content)
    content = parseAlerts(content)
    content = parseShortcodesInner(content)

    return content
}

// 核心短代码解析（包含图片注释处理）
function parseShortcodesInner(content) {
    // 替换短代码结束标签后的 <br> 标签
    content = content
        .replace(/\[\/(alert|window|friend-card|collapsible-panel|timeline|tabs)\](<br\s*\/?>)?/gi, '[/$1]')
        .replace(/\[\/timeline-event\](<br\s*\/?>)?/gi, '[/timeline-event]')
        .replace(/\[\/tab\](<br\s*\/?>)?/gi, '[/tab]');

    // 处理 [alert] 短代码
    content = content.replace(
        /\[alert type="([^"]*)"\]([\s\S]*?)\[\/alert\]/gi,
        (_, type, text) => `<div alert-type="${type}">${text}</div>`
    );

    // 处理 [window] 短代码
    content = content.replace(
        /\[window type="([^"]*)" title="([^"]*)"\]([\s\S]*?)\[\/window\]/gi,
        (_, type, title, text) => {
            const cleanedText = text.replace(/^<br\s*\/?>/, '');
            return `<div window-type="${type}" title="${title}">${cleanedText}</div>`;
        }
    );

    // 处理 [friend-card] 短代码
    content = content.replace(
        /\[friend-card name="([^"]*)" ico="([^"]*)" url="([^"]*)"\]([\s\S]*?)\[\/friend-card\]/gi,
        (_, name, ico, url, description) => 
            `<div friend-name="${name}" ico="${ico}" url="${url}">${description}</div>`
    );

    // 处理 [collapsible-panel] 短代码
    content = content.replace(
        /\[collapsible-panel title="([^"]*)"\]([\s\S]*?)\[\/collapsible-panel\]/gi,
        (_, title, text) => {
            const cleanedText = text.replace(/^<br\s*\/?>/, '');
            return `<div collapsible-panel title="${title}">${cleanedText}</div>`;
        }
    );

    // 处理 [timeline] 短代码
    content = content.replace(
        /\[timeline\]([\s\S]*?)\[\/timeline\]/gi,
        (_, innerContent) => {
            const processedInner = innerContent.replace(
                /\[timeline-event date="([^"]*)" title="([^"]*)"\]([\s\S]*?)\[\/timeline-event\]/gi,
                (_, date, title, eventText) => 
                    `<div timeline-event date="${date}" title="${title}">${eventText}</div>`
            );
            return `<div id="timeline">${processedInner}</div>`;
        }
    );

    // 处理 [tabs] 短代码
    content = content.replace(
        /\[tabs\]([\s\S]*?)\[\/tabs\]/gi,
        (_, innerContent) => {
            const processedInner = innerContent.replace(
                /\[tab title="([^"]*)"\]([\s\S]*?)\[\/tab\]/gi,
                (_, title, tabContent) => {
                    const cleanedContent = tabContent.replace(/^\s*<br\s*\/?>/g, '');
                    return `<div tab-title="${title}">${cleanedContent}</div>`;
                }
            );
            return `<div tabs>${processedInner}</div>`;
        }
    );

    // 处理 [bilibili-card] 短代码
    content = content.replace(
        /\[bilibili-card bvid="([^"]*)"\]/gi,
        (_, bvid) => `
        <div class='bilibili-card'>
            <iframe src="//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0" 
                    scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true">
            </iframe>
        </div>`
    );

    // 图片底部文字注释处理
    return content.replace(
        /<img([^>]*)alt="([^"]*)"([^>]*)>/gi,
        (match, preAttr, alt, postAttr) => 
            alt ? `<figure><img${preAttr}alt="${alt}"${postAttr}><figcaption>${alt}</figcaption></figure>` : match
    );
}

// 解析警告框
function parseAlerts(content) {
    return content.replace(
        /<div alert-type="(.*?)">([\s\S]*?)<\/div>/gi,
        (_, type, innerContent) => {
            const iconMap = {
                green: 'icon-ok-circle',
                blue: 'icon-info-circled',
                yellow: 'icon-attention',
                red: 'icon-cancel-circle'
            };
            const icon = iconMap[type] || 'icon-info-circled';
            return `<div role="alert" class="alert-box ${type}"><i class="${icon}"></i><p class="text-xs font-semibold">${innerContent}</p></div>`;
        }
    );
}

// 解析窗口元素
function parseWindows(content) {
    return content.replace(
        /<div window-type="(.*?)" title="(.*?)">([\s\S]*?)<\/div>/gi,
        (_, type, title, innerContent) => 
            `<div class="notifications-container"><div class="window ${type}"><div class="flex"><div class="window-prompt-wrap">
                <p class="window-prompt-heading">${title}</p>
                <div class="window-prompt-prompt"><p>${innerContent}</p></div>
            </div></div></div></div>`
    );
}

// 解析时间轴
function parseTimeline(content) {
    return content.replace(
        /<div timeline-event date="(.*?)" title="(.*?)">([\s\S]*?)<\/div>/gi,
        (_, date, title, innerContent) => 
            `<div class="timeline-item"><div class="timeline-dot"></div>
            <div class="timeline-content"><div class="timeline-date">${date}</div>
            <p class="timeline-title">${title}</p><p class="timeline-description">${innerContent}</p></div></div>`
    );
}

// 解析图片网格
function parsePicGrid(content) {
    const pattern = /\[PicGrid\]([\s\S]*?)\[\/PicGrid\]/gi;
    let result = content;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const inner = match[1]
            .replace(/<br\s*\/?>/gi, '')
            .replace(/<figcaption>.*?<\/figcaption>/gi, '')
            .replace(/<\/?p>/gi, '')
            .replace(/<figure([^>]*)>/gi, '<figure$1 data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-delay="85">');

        const replacement = `<div class="pic-grid">${inner}</div>`;
        result = result.replace(fullMatch, replacement);
    }

    return result;
}

const ttt = '[alert type="red"]这是一个红色警告。[/alert][alert type="yellow"]这是一个黄色警告。[/alert][alert type="blue"]这是一个蓝色警告。[/alert][alert type="green"]这是一个绿色警告。[/alert][alert type="pink"]这是一个粉色警告。[/alert][friend-card name="好友" ico="avatar.jpg" url="http://example.com"]这是好友的描述。[/friend-card]'

console.log(parseShortcodes(ttt))