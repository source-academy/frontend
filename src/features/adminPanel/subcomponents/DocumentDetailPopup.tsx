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
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useState } from 'react';

import type { Tokens } from '../../../commons/application/types/SessionTypes';
import { savePixelbotDocuments } from '../../../commons/sagas/RequestsSaga';
import classes from './DocumentDirectory.module.css';
import type { PixelbotCategory, PixelbotDocument } from './PixelbotDocumentsTypes';
import { formatReleaseDate, pixelbotDocumentStatus } from './PixelbotDocumentsTypes';

type Draft = {
  title: string;
  description: string;
  releaseDate: string | null;
  categoryId: number;
};

function draftFrom(document: PixelbotDocument): Draft {
  return {
    title: document.title,
    description: document.description,
    releaseDate: document.releaseDate,
    categoryId: document.categoryId,
  };
}

type Props = {
  document: PixelbotDocument | null;
  categories: PixelbotCategory[];
  initialMode: 'view' | 'edit';
  tokens: Tokens;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onDeleteRequested: () => void;
};

function DocumentDetailPopup({
  document,
  categories,
  initialMode,
  tokens,
  onClose,
  onSaved,
  onDeleteRequested,
}: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [draft, setDraft] = useState<Draft | null>(document ? draftFrom(document) : null);
  const [isSaving, setIsSaving] = useState(false);

  if (!document || !draft) {
    return null;
  }

  const saved = draftFrom(document);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const status = pixelbotDocumentStatus(draft.releaseDate);
  const readOnly = mode === 'view';

  const handleCancelEdit = () => {
    setDraft(draftFrom(document));
    setMode('view');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await savePixelbotDocuments(
      [
        {
          id: document.id,
          categoryId: draft.categoryId,
          title: draft.title,
          description: draft.description,
          releaseDate: draft.releaseDate,
        },
      ],
      tokens,
    );
    setIsSaving(false);
    if (result) {
      await onSaved();
      setMode('view');
    }
  };

  return (
    <Dialog
      className={classes.detailDialog}
      isOpen
      onClose={onClose}
      title={mode === 'edit' ? 'Edit document' : document.title}
    >
      <DialogBody>
        <div className={classes.formStack}>
          <FormGroup label="Title">
            <InputGroup
              value={draft.title}
              disabled={readOnly}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
            />
          </FormGroup>
          <div className={classes.formRow2}>
            <FormGroup label="Category">
              <HTMLSelect
                fill
                disabled={readOnly}
                value={draft.categoryId}
                onChange={e => setDraft({ ...draft, categoryId: Number(e.target.value) })}
                options={categoryOptions}
              />
            </FormGroup>
            <FormGroup
              label={`Release date${readOnly ? '' : ' *'}`}
              labelInfo={status}
              intent={!readOnly && !draft.releaseDate ? Intent.DANGER : Intent.NONE}
              helperText={
                readOnly
                  ? formatReleaseDate(draft.releaseDate)
                  : !draft.releaseDate
                    ? 'Select a release date before this document can be saved.'
                    : null
              }
            >
              <input
                type="date"
                className={classNames(Classes.INPUT, Classes.FILL)}
                disabled={readOnly}
                value={draft.releaseDate ?? ''}
                onChange={e => setDraft({ ...draft, releaseDate: e.target.value || null })}
                aria-invalid={!readOnly && !draft.releaseDate}
              />
            </FormGroup>
          </div>
          <FormGroup label="Summary">
            <TextArea
              fill
              rows={4}
              disabled={readOnly}
              value={draft.description}
              onChange={e => setDraft({ ...draft, description: e.target.value })}
            />
          </FormGroup>
        </div>
      </DialogBody>

      {mode === 'view' ? (
        <DialogFooter
          actions={
            <Button
              intent={Intent.PRIMARY}
              icon={IconNames.EDIT}
              text="Edit"
              onClick={() => setMode('edit')}
            />
          }
        />
      ) : (
        <DialogFooter
          actions={
            <>
              <Button text="Cancel" onClick={handleCancelEdit} />
              <Button
                intent={dirty && !!draft.releaseDate ? Intent.PRIMARY : Intent.NONE}
                text="Save changes"
                disabled={!dirty || !draft.releaseDate || isSaving}
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
      )}
    </Dialog>
  );
}

export default DocumentDetailPopup;
