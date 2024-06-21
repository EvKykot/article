export const checkSupportCSS = () => window.CSS && CSS.supports('color', 'var(--fake-var)');

export const changeThemesConstants = (themeTokens: Record<string, string>) => {
    const isSupported = checkSupportCSS();

    if (isSupported) {
        const body = document.getElementsByTagName('body')[0];
        Object.keys(themeTokens).forEach((key) => body.style.setProperty(key, themeTokens[key]));
    }
};