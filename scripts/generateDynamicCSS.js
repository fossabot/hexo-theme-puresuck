hexo.extend.helper.register('generateDynamicCSS', function () {
    const colorScheme = this.theme.colorScheme;
    
    const colorMap = {
        pink: { theme: '#ea868f', hover: '#DB2777' },
        green: { theme: '#48c774', hover: '#15803d' },
        blue: { theme: '#3273dc', hover: '#3B82F6' },
        yellow: { theme: '#feb272', hover: '#B45309' },
        red: { theme: '#ef4444', hover: '#dc2626' },
        purple: { theme: '#8b5cf6', hover: '#7c3aed' },
        cyan: { theme: '#06b6d4', hover: '#0891b2' },
        orange: { theme: '#f97316', hover: '#ea580c' }
    };

    const darkColorMap = {
        pink: { theme: '#b45864', hover: '#d72b6f' },
        green: { theme: '#2e7c55', hover: '#0f6933' },
        blue: { theme: '#2855b0', hover: '#1f55e6' },
        yellow: { theme: '#bf763f', hover: '#934109' },
        red: { theme: '#b91c1c', hover: '#991b1b' },
        purple: { theme: '#6d28d9', hover: '#5b21b6' },
        cyan: { theme: '#0e7490', hover: '#155e75' },
        orange: { theme: '#c2410c', hover: '#9a3412' }
    };

    const colors = colorMap[colorScheme] || colorMap.pink;
    const darkColors = darkColorMap[colorScheme] || colorMap.pink;

    return `
    <style>
        :root {
            --themecolor: ${colors.theme};
            --themehovercolor: ${colors.hover};
        }
        [data-theme="dark"] {
            --themecolor: ${darkColors.theme};
            --themehovercolor: ${darkColors.hover};
        }
    </style>
    `;
});