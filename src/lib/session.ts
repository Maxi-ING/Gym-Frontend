const TOKEN = 'fitanalytics.token';
const MODE = 'fitanalytics.mode';
export const session = {
  token: () => sessionStorage.getItem(TOKEN),
  isDemo: () => sessionStorage.getItem(MODE) === 'demo',
  start(token: string, demo = false) {
    sessionStorage.setItem(TOKEN, token);
    sessionStorage.setItem(MODE, demo ? 'demo' : 'api');
  },
  clear() { sessionStorage.removeItem(TOKEN); sessionStorage.removeItem(MODE); },
};
