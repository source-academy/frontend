import 'i18next';

import { defaultNS } from '../i18n';
import enNs1 from '../locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ns1';
    resources: {
      ns1: typeof enNs1;
    };
  }
}
