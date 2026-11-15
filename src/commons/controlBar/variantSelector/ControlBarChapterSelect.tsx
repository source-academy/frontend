import { Chapter, Variant } from 'js-slang/dist/langs';

import { useConductorEnable } from '../../../features/conductor/flagConductorEnable';
import type { SALanguage } from '../../application/ApplicationTypes';
import ControlBarVariantSelect from './ControlBarVariantSelect';
import LegacyControlBarChapterSelect from './LegacyControlBarChapterSelect';

type Props = {
  handleChapterSelect?: (i: SALanguage, e?: React.SyntheticEvent<HTMLElement>) => void;
  isFolderModeEnabled: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  disabled?: boolean;
  /** The Conductor language to show; defaults to the selected language. */
  languageId?: string;
};

function ControlBarChapterSelect({
  isFolderModeEnabled,
  sourceChapter,
  sourceVariant,
  handleChapterSelect = () => {},
  disabled = false,
  languageId,
}: Props) {
  const directoryEnabled = useConductorEnable();

  if (!directoryEnabled) {
    return (
      <LegacyControlBarChapterSelect
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={sourceChapter}
        sourceVariant={sourceVariant}
        handleChapterSelect={handleChapterSelect}
        disabled={disabled}
      />
    );
  }

  return <ControlBarVariantSelect languageId={languageId} disabled={disabled} />;
}

export default ControlBarChapterSelect;
