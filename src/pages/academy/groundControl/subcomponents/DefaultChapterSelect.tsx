import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemListRenderer, type ItemRenderer, Select } from '@blueprintjs/select';
import { Variant } from 'js-slang/dist/langs';
import { useCallback, useState } from 'react';
import Constants from 'src/commons/utils/Constants';
import { useAppDispatch, useAppSelector, useSession } from 'src/commons/utils/Hooks';

import {
  type SALanguage,
  sourceLanguages,
  styliseSublanguage,
} from '../../../../commons/application/ApplicationTypes';
import ControlButton from '../../../../commons/ControlButton';
import WorkspaceActions from '../../../../commons/workspace/WorkspaceActions';
import { selectConductorEnable } from '../../../../features/conductor/flagConductorEnable';

/**
 * Just the fields `changeSublanguage` actually persists (course config only stores
 * `sourceChapter`/`sourceVariant`) - lets a Conductor language-directory entry (which has no
 * `variant`, `mainLanguage` or `supports` of its own) be selected through the same menu/dialog
 * as a legacy Source `SALanguage` without having to fake those fields.
 */
type LanguageChoice = Pick<SALanguage, 'chapter' | 'variant' | 'displayName'>;

function DefaultChapterSelect() {
  const [chosenLanguage, setChosenLanguage] = useState<LanguageChoice>(sourceLanguages[0]);
  const [isDialogOpen, setDialogState] = useState(false);

  const {
    // Temporarily load the defaults when the course configuration fetch has yet to return
    sourceChapter = Constants.defaultSourceChapter,
    sourceVariant = Constants.defaultSourceVariant,
  } = useSession();

  const isConductorEnabled = useAppSelector(selectConductorEnable);
  const languages = useAppSelector(state => state.languageDirectory.languages);

  // Once Conductor is enabled, `sourceChapter` is a 1-based index into the language directory's
  // `languages` array (see chapterLanguage.ts's `deriveLanguageFromChapter`) rather than a Source
  // chapter - Source is no longer used, so there's no other meaning to distinguish from.
  const items: LanguageChoice[] = isConductorEnabled
    ? languages.map((lang, index) => ({
        chapter: index + 1,
        variant: Variant.DEFAULT,
        displayName: lang.name,
      }))
    : sourceLanguages;

  const currentLanguageName = isConductorEnabled
    ? (languages[sourceChapter - 1]?.name ?? 'Loading…')
    : styliseSublanguage(sourceChapter, sourceVariant);

  const dispatch = useAppDispatch();
  const handleUpdateLanguage = useCallback(
    (lang: LanguageChoice) => dispatch(WorkspaceActions.changeSublanguage(lang)),
    [dispatch],
  );

  const handleOpenDialog = useCallback(
    (choice: LanguageChoice) => {
      setDialogState(true);
      setChosenLanguage(choice);
    },
    [setDialogState, setChosenLanguage],
  );
  const handleCloseDialog = useCallback(() => {
    setDialogState(false);
  }, [setDialogState]);
  const handleConfirmDialog = useCallback(() => {
    setDialogState(false);
    handleUpdateLanguage(chosenLanguage);
  }, [chosenLanguage, setDialogState, handleUpdateLanguage]);

  const chapterRenderer: ItemRenderer<LanguageChoice> = useCallback(
    (lang, { handleClick }) => (
      <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
    ),
    [],
  );

  const chapterListRenderer: ItemListRenderer<LanguageChoice> = useCallback(
    ({ itemsParentRef, renderItem, items }) => {
      const defaultChoices = items.filter(({ variant }) => variant === Variant.DEFAULT);
      const variantChoices = items.filter(({ variant }) => variant !== Variant.DEFAULT);

      return (
        <Menu ulRef={itemsParentRef}>
          {defaultChoices.map(renderItem)}
          {variantChoices.length > 0 && (
            <MenuItem key="variant-menu" text="Variants" icon="cog">
              {variantChoices.map(renderItem)}
            </MenuItem>
          )}
        </Menu>
      );
    },
    [],
  );

  const dialog = (
    <Dialog
      canEscapeKeyClose
      canOutsideClickClose
      className="change-default-lang-dialog"
      icon={IconNames.ERROR}
      isCloseButtonShown
      isOpen={isDialogOpen}
      onClose={handleCloseDialog}
      title="Updating default language"
    >
      <DialogBody>
        Are you sure you want to update the <b>default Playground language</b> from{' '}
        {currentLanguageName} to <b>{chosenLanguage.displayName}</b>?
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <ControlButton
              label="Cancel"
              onClick={handleCloseDialog}
              options={{ variant: 'default' }}
            />
            <ControlButton
              label="Confirm"
              onClick={handleConfirmDialog}
              options={{ variant: 'default', intent: Intent.DANGER }}
            />
          </>
        }
      />
    </Dialog>
  );

  return (
    <>
      <Select<LanguageChoice>
        items={items}
        onItemSelect={handleOpenDialog}
        itemRenderer={chapterRenderer}
        itemListRenderer={chapterListRenderer}
        filterable={false}
      >
        <Button endIcon={IconNames.DOUBLE_CARET_VERTICAL}>
          <span className="hidden-xs hidden-sm">Default language: </span>
          <span>{currentLanguageName}</span>
        </Button>
      </Select>
      {dialog}
    </>
  );
}

export default DefaultChapterSelect;
