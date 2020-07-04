import { InterpolationTokenOptions, InterpolationOptions } from "node-polyglot";

export declare type OnMissingKeyMethodType = (
  key: string,
  options: InterpolationOptions,
  locale: string
) => string;

type I18nConstructorType = {
  locales: Array<string>;
  fallback?: string;
  lazyLoading?: boolean;
  languagesFolder?: string;
  caseSensitive?: boolean;
  syncLoading?: boolean;
  polyglotOptions?: {
    pluralRules?: any;
    interpolation?: InterpolationTokenOptions;
    allowMissing?: boolean;
    onMissingKey?: OnMissingKeyMethodType;
  };
};

export default I18nConstructorType;
