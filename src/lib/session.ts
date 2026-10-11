const TOKEN = 'fitanalytics.token';
const MODE = 'fitanalytics.mode';
export const session = {
  token: () => sessionStorage.getItem(TOKEN),
  demoRole: () =>
    sessionStorage.getItem('fitanalytics.demoRole') === 'admin'
      ? ('admin' as const)
      : ('usuario' as const),
  isDemo: () => sessionStorage.getItem(MODE) === 'demo',
  start(token: string, demo = false, rol: 'admin' | 'usuario' = 'usuario') {
    sessionStorage.setItem(TOKEN, token);
    sessionStorage.setItem('fitanalytics.demoRole', rol);
    sessionStorage.setItem(MODE, demo ? 'demo' : 'api');
  },
  clear() {
    sessionStorage.removeItem(TOKEN);
    sessionStorage.removeItem('fitanalytics.demoRole');
    sessionStorage.removeItem(MODE);
  },
};
