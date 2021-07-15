function getMetaContent(name) {
  // TODO: 从 top 页面再拿一次？
  const dom = window.document.querySelector(`meta[name=${name}]`);
  return (dom ? dom.getAttribute('content') || '' : '').trim();
}

export function hasArmsSdk() {
  return !!window.__bl;
}

// arms api() 接口调用手动上报 https://yuque.antfin-inc.com/retcode/arms-retcode/api#8honkp
export function armsReportApi(params) {
  const { url, isSuccess, time, code, msg, begin } = params;
  if (hasArmsSdk()) {
    try {
      window.__bl && window.__bl.api(url, isSuccess, time, code, msg, begin);
    } catch (error) {
      console.error(error);
    }
  }
}

export function getApiErrorMsg(axiosErr = {}) {
  let hemaosLoginInfo = null;
  let ajaxErrorInfo = { axiosErrMsg: axiosErr.message };
  if (axiosErr.response) {
    const { status, statusText, request: { responseText } } = axiosErr.response;
    ajaxErrorInfo = {
      xhrStatus: status,
      xhrStatusText: statusText,
      xhrResponseText: responseText,
      ...ajaxErrorInfo,
    };
  }
  try {
    hemaosLoginInfo = JSON.parse(localStorage.getItem('hemaos_login_info'));
    /* eslint-disable no-empty */
  } catch (e) {}
  if (hemaosLoginInfo && hemaosLoginInfo.username && hemaosLoginInfo.workNumber) {
    const { username, workNumber } = hemaosLoginInfo;
    return { username, workNumber, ...ajaxErrorInfo };
  }
  return ajaxErrorInfo;
}

export function isCsrfEnable() {
  return getMetaContent('_csrf_enable') === 'true';
}

export function getCsrf() {
  return {
    header: getMetaContent('_csrf_header'),
    token: getMetaContent('_csrf'),
  };
}

export function getContentType(headers = {}) {
  return headers['Content-Type'] || headers['content-type'];
}
