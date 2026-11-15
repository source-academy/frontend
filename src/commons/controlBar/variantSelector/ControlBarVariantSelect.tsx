import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemListRenderer, type ItemRenderer, Select } from '@blueprintjs/select';
import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { getFamilyLanguages, getVariantLabel } from '../../../features/directory/languageFamily';
import { useAppDispatch, useAppSelector } from '../../utils/Hooks';

type Props = {
  /** The variant to show; defaults to the selected language. */
  languageId?: string;
  disabled?: boolean;
};

function ControlBarVariantSelect({ languageId, disabled = false }: Props) {
  const dispatch = useAppDispatch();
  const selectedLanguageId = useAppSelector(s => s.languageDirectory.selectedLanguageId);
  const languages = useAppSelector(s => s.languageDirectory.languages);
  const languageMap = useAppSelector(s => s.languageDirectory.languageMap);

  const shownLanguageId = languageId ?? selectedLanguageId;
  const currentLanguage = shownLanguageId ? languageMap[shownLanguageId] : undefined;
  const variants = currentLanguage ? getFamilyLanguages(languages, currentLanguage) : [];
  const isDisabled = disabled || variants.length <= 1;

  const variantListRenderer: ItemListRenderer<ILanguageDefinition> = ({
    itemsParentRef,
    renderItem,
    items,
  }) => (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(renderItem)}
    </Menu>
  );

  const variantRenderer: ItemRenderer<ILanguageDefinition> = (variant, { handleClick }) => (
    <MenuItem key={variant.id} onClick={handleClick} text={getVariantLabel(variant, variants)} />
  );

  const onSelectVariant = (variant: ILanguageDefinition) => {
    if (variant.id !== selectedLanguageId) {
      dispatch(LanguageDirectoryActions.setSelectedLanguage(variant.id));
    }
  };

  return (
    <Select<ILanguageDefinition>
      items={variants}
      onItemSelect={onSelectVariant}
      itemRenderer={variantRenderer}
      itemListRenderer={variantListRenderer}
      filterable={false}
      disabled={isDisabled}
    >
      <Button
        variant="minimal"
        text={currentLanguage ? getVariantLabel(currentLanguage, variants) : 'Select Language'}
        endIcon={isDisabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        data-testid="ControlBarVariantSelect"
        disabled={isDisabled}
      />
    </Select>
  );
}

export default ControlBarVariantSelect;
