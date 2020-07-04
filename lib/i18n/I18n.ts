import { I18nConstructorType, OnMissingKeyMethodType } from "../interfaces";
import fs from "fs";
import glob from "glob";
import Polyglot from "node-polyglot";
import { Obj } from "@noreajs/common";

export default class I18n {
  static FILE_EXTENSION = "json";
  private localeFiles: string[] = [];
  private locales: string[];
  private folder: string;
  private lazyLoading: boolean;
  private caseSensitive: boolean;
  private translations: {
    [locale: string]: any;
  } = {};
  private polyglot: Polyglot;

  constructor(init: I18nConstructorType) {
    // params validation
    this.validateParams(init);

    // init parameters
    this.locales = JSON.parse(JSON.stringify(init.locales).toLowerCase());
    this.folder = init.languagesFolder ?? "i18n";
    this.lazyLoading = init.lazyLoading ?? false;
    this.caseSensitive = init.caseSensitive ?? false;

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

  /**
   * Validate parameters
   * @param init parameters
   */
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

  /**
   * Load transactions asynchronously
   * @param callback callback
   */
  async loadTranslations(
    callback?: (translations: any) => void | Promise<void>
  ) {
    await this.readLocalFiles(callback);
  }

  /**
   * Create translations initial files if not exists
   */
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

  /**
   * Initialize translations object
   */
  private initTranslations() {
    for (const locale of this.locales) {
      this.translations[locale.toLowerCase()] = {};
    }
  }

  /**
   * Load translations files
   * @param callback callback
   */
  private async readLocalFiles(
    callback?: (translations: any) => void | Promise<void>
  ) {
    const allFiles = await glob(
      `${this.folder}/**/*.${I18n.FILE_EXTENSION}`,
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

  /**
   * Read local files synchronously
   */
  private readLocalFilesSync() {
    this.localeFiles = glob.sync(`${this.folder}/**/*.${I18n.FILE_EXTENSION}`);

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

  /**
   * Read a single translation file
   * @param filePath file path
   */
  private readLocalFile(filePath: string) {
    if (fs.statSync(filePath).isFile()) {
      const pathParts = this.explodePath(filePath);
      const jsonContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const pathStr = JSON.stringify([
        ...pathParts.internalPath,
        pathParts.file.name,
      ]);

      Obj.assignNestedProperty(
        this.translations[pathParts.locale],
        this.caseSensitive === false
          ? JSON.parse(pathStr.toLowerCase())
          : JSON.parse(pathStr),
        jsonContent
      );
    } else {
      throw console.warn("readLocalFile: the given path is not a file path");
    }
  }

  /**
   * File path related to a the given key and locale
   * @param key phrase
   * @param locale locale
   */
  private keyToPath(key: string, locale: string) {
    // define locale files depending on caseSensitive state
    const localeFilesStr =
      this.caseSensitive === false
        ? JSON.stringify(this.localeFiles).toLowerCase()
        : JSON.stringify(this.localeFiles);

    // file path
    let filePath = `${this.folder}/${locale.toLowerCase()}`;

    // phrase parts
    const keyParts = key.split(".");

    for (const key of keyParts) {
      filePath = `${filePath}/${key}`;

      // potential path
      const path =
        this.caseSensitive === false
          ? `${filePath}.${I18n.FILE_EXTENSION}`.toLowerCase()
          : `${filePath}.${I18n.FILE_EXTENSION}`;

      if (JSON.parse(localeFilesStr).includes(path)) {
        return path;
      }
    }
    return undefined;
  }

  /**
   * Explode file path in parts
   * @param path path
   */
  private explodePath(path: string) {
    const folderPathParts = this.folder.split(/[\\\/]/);
    const parts = path.split(/[\\\/]/);
    const fileName = parts[parts.length - 1];
    const fileNameParts = fileName.split(".");
    return {
      file: {
        name: fileNameParts[0],
        ext: fileNameParts[1],
      },
      folder: parts.slice(0, folderPathParts.length - 1),
      locale: parts[1],
      internalPath: parts.slice(folderPathParts.length + 1, parts.length - 1),
      parts,
    };
  }

  /**
   * Set locale
   * @param value new locale
   */
  setLocale(value: string) {
    if (value) {
      // locale in lower case
      const locale = value.toLowerCase();

      if (this.locales.includes(locale)) {
        // set polyglot locale
        this.polyglot.locale(locale);

        // replace phrases in case of eager loading
        if (!this.lazyLoading) {
          this.polyglot.replace(this.translations[locale]);
        }
      } else {
        throw console.warn(
          `setLocale: language ${locale} is not supported. The current languages are [${this.locales.join(
            ", "
          )}]`
        );
      }
    }
  }

  /**
   * Get locale
   */
  getLocale(): string {
    return this.polyglot.locale();
  }

  /**
   * Get translations
   */
  getTranslations() {
    return this.translations;
  }

  /**
   * Translate a key
   * @param phrase translation key
   * @param options translation options
   */
  t(
    phrase: string,
    options?: number | Polyglot.InterpolationOptions | undefined
  ) {
    const locale = this.polyglot.locale().toLowerCase();
    const key = this.caseSensitive === false ? phrase.toLowerCase() : phrase;

    // lazy loading code
    if (this.lazyLoading) {
      const filePath = this.keyToPath(key, locale);
      if (filePath) {
        // read the related file
        this.readLocalFile(filePath);
        // extend polyglot phrase
        this.polyglot.extend(this.translations[locale]);
      } else {
        console.warn(`t: ${key} related file does not exist.`);
      }
    }
    return this.polyglot.t(key, options);
  }
}
