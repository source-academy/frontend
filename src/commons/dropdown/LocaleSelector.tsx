import { FormGroup, HTMLSelect, Icon, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';
import i18n from 'src/i18n/i18n';
import { i18nLanguageCode, resources } from 'src/i18n/locales';

const languageOptions = Object.keys(resources).map(abbr => ({
  label: resources[abbr as keyof typeof resources]?.name,
  value: abbr
}));

const LocaleSelector: React.FC = () => {
  const [currI18nLanguage, setI18nLanguage] = useState(i18n.language)!;

  const handleLanguageChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const targetLanguage: i18nLanguageCode = e.target.value as i18nLanguageCode;

    setI18nLanguage(targetLanguage);
    i18n.changeLanguage(targetLanguage);
  };

  return (
    <FormGroup label="Language: " labelFor="language-binding" inline>
      <HTMLSelect
        id="language-binding"
        options={languageOptions}
        value={currI18nLanguage}
        onChange={handleLanguageChange}
      />
      <Tooltip
        position={PopoverPosition.TOP}
        className="form-field-help-text"
        content="Choose your language."
      >
        <Icon icon={IconNames.Help} />
      </Tooltip>
    </FormGroup>
  );
};

export default LocaleSelector;
