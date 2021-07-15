import { HippoRequestConfig } from '@alife/hippo-request';
import { HippoRequestNormalizer } from './data';

type Apimap = {
  [href: string]: Partial<{
    local: string | number;
    pre: string | number;
    development: string | number;
    production: string | number;
    // 除了四个默认的环境，也允许其他环境，传入 number 表示使用 rapapi 的 mock 数据
    [env: string]: string | number;
  }>;
};

export interface HippoService {
  <T = any>(data?: any, requestConfig?: HippoRequestConfig): Promise<T>;
}

export interface HippoServiceExtraConfig {
  url?: string;
  api?: string;
  mock?: boolean;
  method?: 'get' | 'delete' | 'head' | 'post' | 'patch' | 'jsonp';

  /** 将请求的数据 payload 转换成接口所需要的格式.
   * @see https://yuque.antfin-inc.com/wdk-pgs/super-x/data-process */
  normalizer?: HippoRequestNormalizer;

  /** 控制 service 的错误处理逻辑。
   * 返回值为 true, 表示不要再继续抛出错误；
   * 返回值为 false, 表示错误会继续抛出 (默认行为) */
  onError?(err?: any): void | boolean;

  /** 控制错误消息。
   * false: 禁止默认的错误提示；
   * true: 显示默认的错误消息 (默认行为)；
   * string: 出现错误时将显示此消息。 */
  errorTips?: boolean | string;
}

export type HippoServiceConfig = HippoRequestConfig & HippoServiceExtraConfig;

export interface HippoServiceCluster {
  [name: string]: HippoServiceCluster | HippoService;
}

export function createService(
  config: HippoServiceConfig,
  apienv?: Apimap,
): HippoService;

export function createServices<T>(
  configs: { [name in keyof T]: HippoServiceConfig },
  apienv?: Apimap,
  defaultConfig?: HippoServiceConfig,
): { [name in keyof T]: HippoService };
