window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetApp = urlParams.get('target');

    setTimeout(() => {
        if (targetApp) {
            window.location.replace(targetApp);
        } else {
            window.location.replace('about:blank');
        }
    }, 3000);
};
