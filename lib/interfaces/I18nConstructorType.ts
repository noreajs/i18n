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
  customHeader?: string;
  userLocaleLookup?: Function;
  pluralRules?: any;
  caseSensitive?: boolean;
  onlyDotAsSeparator?: boolean;
  syncLoading?: boolean;
  polyglotOptions?: {
    interpolation?: InterpolationTokenOptions;
    allowMissing?: boolean;
    onMissingKey?: OnMissingKeyMethodType;
  };
};

export default I18nConstructorType;
