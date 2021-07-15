import { armsReportApi } from './core/utils';

const AJAX_REPORT = Symbol('ajax-report');
const TOAST = Symbol('toast');
const HANDLE_RESPONSE = Symbol('handle-response');
const TOAST_WARN_TIPS = '注意: toast 未定义, 请设置 hippo-request 的 globalConfig.toast 属性';

const defaultToast = {
  success (msg) {
    // do nothing
    console.warn('[success] %s (%s)', msg, TOAST_WARN_TIPS);
  },
  error (msg) {
    console.error('[error] %s (%s)', msg, TOAST_WARN_TIPS);
  }
};

class GlobalConfig {
  constructor () {
    this[AJAX_REPORT] = armsReportApi;
    this[TOAST] = defaultToast;
  }

  get ajaxReport () {
    return this[AJAX_REPORT];
  }

  set ajaxReport (reporter) {
    if (typeof reporter !== 'function') {
      throw new Error('ajaxReport should be a function');
    }
    this[AJAX_REPORT] = reporter;
  }

  get toast () {
    return this[TOAST];
  }

  set toast (toast) {
    if (toast && toast.success && toast.error) {
      this[TOAST] = toast;
    } else {
      console.error('toast is invalid, will use default toast');
    }
  }

  get handleResponse () {
    return this[HANDLE_RESPONSE];
  }

  set handleResponse (handler) {
    if (typeof handler !== 'function') {
      throw new Error('handleResponse is not a function');
    }
    this[HANDLE_RESPONSE] = handler;
  }
}

export default new GlobalConfig();
