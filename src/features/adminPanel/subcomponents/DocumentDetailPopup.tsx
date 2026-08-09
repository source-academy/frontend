import {
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  Switch,
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useState } from 'react';

import type { Tokens } from '../../../commons/application/types/SessionTypes';
import { savePixelbotDocuments } from '../../../commons/sagas/RequestsSaga';
import classes from './DocumentDirectory.module.css';
import type { PixelbotCategory, PixelbotDocument } from './PixelbotDocumentsTypes';

/** The editable part of a document, shared by the add-documents modal and this popup. */
export type DocumentDraft = {
  title: string;
  description: string;
  releaseDate: string | null;
  categoryId: number | null;
};

export const isDraftComplete = (draft: DocumentDraft) =>
  draft.categoryId !== null && !!draft.releaseDate;

const REQUIRED_HELPER = 'Required before this document can be saved.';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function DocumentFields({
  draft,
  categories,
  onChange,
}: {
  draft: DocumentDraft;
  categories: PixelbotCategory[];
  onChange: (patch: Partial<DocumentDraft>) => void;
}) {
  const missingCategory = draft.categoryId === null;
  const missingDate = !draft.releaseDate;
  const releaseNow = draft.releaseDate === todayIso();

  return (
    <>
      <FormGroup label="Title" labelFor="doc-title">
        <InputGroup
          id="doc-title"
          value={draft.title}
          onChange={e => onChange({ title: e.target.value })}
        />
      </FormGroup>
      <div className={classes.formRow2}>
        <FormGroup
          label="Category *"
          labelFor="doc-category"
          intent={missingCategory ? Intent.DANGER : Intent.NONE}
          helperText={missingCategory ? REQUIRED_HELPER : null}
        >
          <HTMLSelect
            id="doc-category"
            fill
            value={draft.categoryId ?? ''}
            onChange={e => onChange({ categoryId: Number(e.target.value) })}
            options={[
              { value: '', label: 'Select a category', disabled: true },
              ...categories.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
        </FormGroup>
        <FormGroup
          label="Release date *"
          labelFor="doc-release-date"
          intent={missingDate ? Intent.DANGER : Intent.NONE}
          helperText={missingDate ? REQUIRED_HELPER : null}
        >
          <Switch
            checked={releaseNow}
            label="Release immediately"
            onChange={() => onChange({ releaseDate: releaseNow ? null : todayIso() })}
          />
          <input
            id="doc-release-date"
            type="date"
            className={classNames(Classes.INPUT, Classes.FILL)}
            value={draft.releaseDate ?? ''}
            disabled={releaseNow}
            onChange={e => onChange({ releaseDate: e.target.value || null })}
          />
        </FormGroup>
      </div>
      <FormGroup label="Summary" labelFor="doc-summary">
        <TextArea
          id="doc-summary"
          fill
          rows={4}
          value={draft.description}
          onChange={e => onChange({ description: e.target.value })}
        />
      </FormGroup>
    </>
  );
}

type Props = {
  document: PixelbotDocument;
  categories: PixelbotCategory[];
  tokens: Tokens;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onDeleteRequested: () => void;
};

function DocumentDetailPopup({
  document,
  categories,
  tokens,
  onClose,
  onSaved,
  onDeleteRequested,
}: Props) {
  const [draft, setDraft] = useState<DocumentDraft>({
    title: document.title,
    description: document.description,
    releaseDate: document.releaseDate,
    categoryId: document.categoryId,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await savePixelbotDocuments(
        [{ ...draft, id: document.id, categoryId: draft.categoryId! }],
        tokens,
      );
      if (result) {
        await onSaved();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog className={classes.detailDialog} isOpen onClose={onClose} title="Edit document">
      <DialogBody>
        <DocumentFields
          draft={draft}
          categories={categories}
          onChange={patch => setDraft({ ...draft, ...patch })}
        />
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text="Cancel" onClick={onClose} />
            <Button
              intent={Intent.PRIMARY}
              text="Save changes"
              disabled={!isDraftComplete(draft) || isSaving}
              loading={isSaving}
              onClick={handleSave}
            />
          </>
        }
      >
        <Button
          minimal
          intent={Intent.DANGER}
          icon={IconNames.TRASH}
          text="Delete document"
          onClick={onDeleteRequested}
        />
      </DialogFooter>
    </Dialog>
  );
}

export default DocumentDetailPopup;
