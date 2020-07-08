# i18n
Library of tools necessary for the internationalization of an application, based on polyglot from airbnb.

## Installation

```typescript
npm install @noreajs/i18n --save
```

The package already contains it's types definitions files for typescript developers.

## Usage

**Translations files**

The default translation file is `i18n`. If the folder doesn't exit, it will be created automatically by the package.

**Synchronous** initialize i18n

```typescript
import I18n from "../i18n/I18n";

const i18n = new I18n({
    locales: ["en-US", "en-FR"],
    fallback: "en-fr",
    languagesFolder: "i18n" // i18n is the default value and it is optional.
});

// set the locale
i18n.setLocale("en-US");

i18n.t("users.index.empty");
```

**Asynchronous** initialization

```typescript
import I18n from "../i18n/I18n";

const i18n = new I18n({
    locales: ["en-US", "en-FR"],
    fallback: "en-fr",
    syncLoading: false
});

// load translations (asynchronous method)
i18n.loadTranslations((data) => {
    i18n.setLocale("en-fr");
    console.log("t:", i18n.t("users.index.empty"));
});
```

## I18n parameters

To initialize a the i18n package, you need to fill some parameters.

| Property        | Type                                                         | Default               | Note                                                         |
| --------------- | ------------------------------------------------------------ | --------------------- | ------------------------------------------------------------ |
| locales         | Array<string>                                                |                       | Locale supported                                             |
| fallback        | string                                                       | first `locales` value | Fallback locale                                              |
| languagesFolder | string                                                       | `i18n`                | Folder where translations files are stored. This folder is automatically created when not exists |
| lazyLoading     | boolean                                                      | false                 | Resolve translation key while translate                      |
| caseSensitive   | boolean                                                      | false                 | `users.index.empty` and `users.index.EMPTY` will be treated the same way |
| syncLoading     | boolean                                                      | true                  | Load translations during initialization                      |
| polyglotOptions | [polyglot options](https://www.npmjs.com/package/node-polyglot#options-overview) |                       | Only **interpolation**, **allowMissing** and **onMissingKey** is allowed |

## I18n methods

| Method           | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| setLocale        | Change the current locale                                    |
| getLocale        | Get the current locale                                       |
| getTranslations  | Get the available translations loaded from files             |
| loadTransactions | Asynchronous method to load translations when **syncLoading** is false |
| t                | Translate a given key                                        |

