import App from './scripts/app';

const app = new App();

window.addEventListener('resize', app.onResize.bind(app));
