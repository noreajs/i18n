type I18nConstructorType = {
  locales: Array<string>;
  default?: string;
  languagesFolder?: string;
  customHeader?: string;
  userLocaleLookup?: Function;
  interpolation?: { prefix: string; suffix: string };
  pluralRules?: any;
};

export default I18nConstructorType;
