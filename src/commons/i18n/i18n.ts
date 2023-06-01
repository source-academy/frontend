import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { Links } from '../utils/Constants';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          introduction: {
            main: `Welcome to the Source Academy playground!
            The book [_Structure and Interpretation of Computer Programs, JavaScript Edition_](${Links.textbook}) uses JavaScript sublanguages that we call [_Source_](${Links.sourceDocs}).\n`,
            docs: ``,
            hotkeys: `\nIn the editor on the left, you can use the [_Ace keyboard shortcuts_](${Links.aceHotkeys}) and the [_Source Academy keyboard shortcuts_](${Links.sourceHotkeys}).`
          }
        }
      },

      zh: {
        translation: {
          introduction: {
            main: `欢迎来到源学院游乐场！ 这本书 [_Structure and Interpretation of Computer Programs, JavaScript Edition_](${Links.textbook}) 使用了我们称之为 [_Source_](${Links.sourceDocs}) 的 JavaScript 子语言。\n`,
            docs: ``,
            hotkeys: `\n在左侧的编辑器中，您可以使用 [_Ace 键盘快捷键_](${Links.aceHotkeys}) 和 [_Source Academy 键盘快捷键_](${Links.sourceHotkeys})。`
          }
        }
      }
    }
  });

export default i18n;
