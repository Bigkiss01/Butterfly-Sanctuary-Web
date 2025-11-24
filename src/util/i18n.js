import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import th from '../locales/th.json';
import zh from '../locales/zh.json';
import ru from '../locales/ru.json';
import ko from '../locales/ko.json';
import ja from '../locales/ja.json';
import ar from '../locales/ar.json';

const resources = {
  en: { translation: en },
  th: { translation: th },
  zh: { translation: zh },
  ru: { translation: ru },
  ko: { translation: ko },
  ja: { translation: ja },
  ar: { translation: ar },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: { useSuspense: false },
  });

export default i18n;
