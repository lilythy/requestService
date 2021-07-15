declare interface HippoToast {
  success(msg: string): any,
  error(msg: string): any
}

declare interface HippoRequestGloablConfig {
  toast: HippoToast,
  ajaxReport(params: object): any
}

declare const globalConfig: HippoRequestGloablConfig;

export default globalConfig;