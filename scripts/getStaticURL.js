hexo.extend.helper.register('getStaticURL', function(path) {
    const cdnConfig = this.theme.cdn || 'local';
    
    const staticMap = {
        local: {
            'aos.js': `${this.url_for('/js/lib/aos.js')}`,
            'aos.css': `${this.url_for('/css/lib/aos.css')}`,
            'a11y-dark.min.css': `${this.url_for('/css/lib/a11y-dark.min.css')}`,
            'medium-zoom.min.js': `${this.url_for('/js/lib/medium-zoom.min.js')}`,
            'highlight.min.js': `${this.url_for('/js/lib/highlight.min.js')}`,
            'pjax.min.js': `${this.url_for('/js/lib/pjax.min.js')}`,
            'pace.min.js': `${this.url_for('/js/lib/pace.min.js')}`,
            'pace-theme-default.min.css': `${this.url_for('/css/lib/pace-theme-default.min.css')}`
        },
        bootcdn: {
            'aos.js': 'https://cdn.bootcdn.net/ajax/libs/aos/2.3.4/aos.js',
            'aos.css': 'https://cdn.bootcdn.net/ajax/libs/aos/2.3.4/aos.css',
            'a11y-dark.min.css': 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.10.0/styles/a11y-dark.min.css',
            'medium-zoom.min.js': 'https://cdn.bootcdn.net/ajax/libs/medium-zoom/1.1.0/medium-zoom.min.js',
            'highlight.min.js': 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.10.0/highlight.min.js',
            'pjax.min.js': 'https://cdn.bootcdn.net/ajax/libs/pjax/0.2.8/pjax.min.js',
            'pace.min.js': 'https://cdn.bootcdn.net/ajax/libs/pace/1.2.4/pace.min.js',
            'pace-theme-default.min.css': 'https://cdn.bootcdn.net/ajax/libs/pace/1.2.4/pace-theme-default.min.css'
        },
        cdnjs: {
            'aos.js': 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js',
            'aos.css': 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css',
            'a11y-dark.min.css': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/a11y-dark.min.css',
            'medium-zoom.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/medium-zoom/1.1.0/medium-zoom.min.js',
            'highlight.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js',
            'pjax.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pjax/0.2.8/pjax.min.js',
            'pace.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pace/1.2.4/pace.min.js',
            'pace-theme-default.min.css': 'https://cdnjs.cloudflare.com/ajax/libs/pace/1.2.4/pace-theme-default.min.css'
        }
    };

    if (staticMap[cdnConfig]?.[path]) {
        return staticMap[cdnConfig][path];
    }
    return staticMap.local[path];
});