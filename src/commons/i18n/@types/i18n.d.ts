import 'i18next';

import { defaultNS } from '../i18n';
import enNs1 from '../locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof enNs1;
  }
}
// eslint-disable-next-line import/first
import { defaultNS } from '../i18n';
import enNs1 from '../locales/en.json';
// eslint-disable-next-line import/first
import Resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ns1';
    resources: {
      ns1: typeof enNs1;
    };
  }
}
