import getUrlParse from 'url-parse';

export default [
  config => {
    const zmockConfig = window._ZMOCK_CONFIG || {};
    if (zmockConfig.domainPath && config.mockToken) {
      let { href, pathname } = getUrlParse(config.url);
      config.headers = {
        ...(config.headers || {}),
        'zmock-url': config.mapi || href,
        'zmock-protocol': config.protocol || 'HTTP',
        'zmock-env': config.mockEnv || window._APIMAP_ENV
      };
      if (config.protocol === 'ARK') {
        pathname = `/${config.api}`;
      }
      if (config.protocol === 'MTOP') {
        pathname = `/${config.mapi}`;
      }
      config.url = `${zmockConfig.domainPath}/data/${config.mockToken}${pathname}`;
    }
    return config;
  },
  // undefined,
];
