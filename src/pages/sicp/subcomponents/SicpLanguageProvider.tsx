import { createContext, useCallback, useContext, useState } from 'react';
import {
  getSicpLanguageFromLocalStorage,
  SICP_DEFAULT_LANGUAGE,
  type SicpSupportedLanguage
} from 'src/features/sicp/utils/SicpUtils';

type SicpLanguageContext = {
  sicpLanguage: SicpSupportedLanguage;
  setSicpLanguage: (lang: SicpSupportedLanguage) => void;
};

const sicpLanguageContext = createContext<SicpLanguageContext | undefined>(undefined);

export const useSicpLanguageContext = (): SicpLanguageContext => {
  const context = useContext(sicpLanguageContext);
  if (!context) {
    throw new Error('useSicpLanguageContext must be used inside an SicpLanguageContextProvider');
  }

  return context;
};

export const SicpLanguageContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [lang, setLang] = useState<SicpSupportedLanguage>(
    getSicpLanguageFromLocalStorage() ?? SICP_DEFAULT_LANGUAGE
  );

  const handleLangChange = useCallback((newLang: SicpSupportedLanguage) => {
    setLang(newLang);
  }, []);

  return (
    <sicpLanguageContext.Provider
      value={{
        sicpLanguage: lang,
        setSicpLanguage: handleLangChange
      }}
    >
      {children}
    </sicpLanguageContext.Provider>
  );
};
