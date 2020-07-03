import { I18nConstructorType } from "../interfaces";
import fs from "fs";

class I18n {
  private locale: string;
  private folder: string;

  constructor(init: I18nConstructorType) {
    // params validation
    this.validateParams(init);

    // init parameters
    this.locale = init.default ?? init.locales[0];
    this.folder = init.languagesFolder ?? "./i18n";
  }

  private validateParams(init: I18nConstructorType) {
    if (init.locales.length) {
      throw Error("locales: At least one language is required.");
    }

    if (init.default && !init.locales.includes(init.default)) {
      throw Error("default: The default value must be in locales array");
    }
  }

  private syncLocalFiles(locales: Array<string>) {
    for (const locale of locales) {
      const localePath = `${this.folder}/${locale.toLowerCase()}`;
      if (!fs.existsSync(localePath)) {
        fs.mkdir(
          localePath,
          {
            recursive: true,
          },
          (err: NodeJS.ErrnoException | null, path: string) => {
            if (err) {
              throw err;
            }
          }
        );
      }
    }
  }

  private readLocalFiles() {}

  setLocale(value: string) {}

  getLocale(): string {
    return "";
  }

  t(phrase: string, params?: any) {}
}
