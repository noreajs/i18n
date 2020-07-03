import { I18nConstructorType, OnMissingKeyMethodType } from "../interfaces";
import fs from "fs";
import glob from "glob";
import Polyglot from "node-polyglot";
import { Obj } from "@noreajs/common";

export default class I18n {
  private localeFiles: string[] = [];
  private locales: string[];
  private folder: string;
  private lazyLoading: boolean;
  private caseSensitive: boolean;
  private onlyDotAsSeparator: boolean;
  private translations: {
    [locale: string]: any;
  } = {};
  private polyglot: Polyglot;

  constructor(init: I18nConstructorType) {
    // params validation
    this.validateParams(init);

    // init parameters
    this.locales = init.locales;
    this.folder = init.languagesFolder ?? "i18n";
    this.lazyLoading = init.lazyLoading ?? false;
    this.caseSensitive = init.caseSensitive ?? false;
    this.onlyDotAsSeparator = init.onlyDotAsSeparator ?? false;

    const defaultLocale = init.fallback ?? init.locales[0];

    // initialize polyglot instance
    this.polyglot = new Polyglot({
      locale: defaultLocale,
      interpolation: init.polyglotOptions?.interpolation,
      allowMissing: init.polyglotOptions?.allowMissing,
      onMissingKey: init.polyglotOptions?.onMissingKey,
    });

    /**
     * Calling initialisation methods
     */
    this.initTranslations();
    this.syncLocalFiles();

    if (!init.syncLoading || init.syncLoading === true)
      this.readLocalFilesSync();
  }

  private validateParams(init: I18nConstructorType) {
    if (init.locales.length === 0) {
      throw console.warn("locales: At least one language is required.");
    }

    if (init.fallback && !init.locales.includes(init.fallback)) {
      throw console.warn(
        "default: The fallback value must be in locales array"
      );
    }
  }

  async loadTranslations(
    callback?: (translations: any) => void | Promise<void>
  ) {
    await this.readLocalFiles(callback);
  }

  private syncLocalFiles() {
    for (const locale of this.locales) {
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

  private initTranslations() {
    for (const locale of this.locales) {
      this.translations[locale.toLowerCase()] = {};
    }
  }

  private async readLocalFiles(
    callback?: (translations: any) => void | Promise<void>
  ) {
    const allFiles = await glob(
      `${this.folder}/**/*.json`,
      (err: Error | null, matches: string[]) => {
        if (err) {
          throw err;
        } else {
          this.localeFiles = matches;

          /**
           * For eager loading
           */
          if (!this.lazyLoading) {
            for (const filePath of matches) {
              if (fs.statSync(filePath).isFile()) {
                this.readLocalFile(filePath);
              }
            }

            // update polyglot phrases
            this.polyglot.replace(
              this.translations[this.polyglot.locale().toLowerCase()]
            );
          }
          if (callback) {
            callback(this.translations);
          }
        }
      }
    );
  }

  private readLocalFilesSync() {
    this.localeFiles = glob.sync(`${this.folder}/**/*.json`);

    /**
     * For eager loading
     */
    if (!this.lazyLoading) {
      for (const filePath of this.localeFiles) {
        if (fs.statSync(filePath).isFile()) {
          this.readLocalFile(filePath);
        }
      }

      // update polyglot phrases
      this.polyglot.replace(
        this.translations[this.polyglot.locale().toLowerCase()]
      );
    }
  }

  private readLocalFile(filePath: string) {
    if (fs.statSync(filePath).isFile()) {
      const pathParts = this.explodePath(filePath);
      const jsonContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      Obj.assignNestedProperty(
        this.translations[pathParts.locale],
        [...pathParts.internalPath, pathParts.file.name],
        jsonContent
      );
    } else {
      throw console.warn("readLocalFile: the given path is not a file path");
    }
  }

  private keyPrefix(filePath: string) {
    const pathParts = this.explodePath(filePath);
    return this.onlyDotAsSeparator
      ? `${[...pathParts.internalPath, pathParts.file.name].join(".")}.`
      : `${[...pathParts.internalPath, pathParts.file.name].join("/")}.`;
  }

  private explodePath(path: string) {
    const parts = path.split(/[\\\/]/);
    const fileName = parts[parts.length - 1];
    const fileNameParts = fileName.split(".");
    return {
      file: {
        name: fileNameParts[0],
        ext: fileNameParts[1],
      },
      folder: parts[0],
      locale: parts[1],
      internalPath: parts.slice(2, parts.length - 1),
      parts,
    };
  }

  setLocale(value: string) {
    if (this.locales.includes(value)) {
      // set polyglot locale
      this.polyglot.locale(value);

      // replace phrases in case of eager loading
      if (!this.lazyLoading) {
        this.polyglot.replace(this.translations[value.toLowerCase()]);
      }
    } else {
      throw console.warn(
        `setLocale: value must be in [${this.locales.join(", ")}]`
      );
    }
  }

  getLocale(): string {
    return this.polyglot.locale();
  }

  getTranslations() {
    return this.translations;
  }

  t(
    phrase: string,
    options?: number | Polyglot.InterpolationOptions | undefined
  ) {
    if (!this.lazyLoading) {
    }
    return this.polyglot.t(phrase, options);
  }
}
