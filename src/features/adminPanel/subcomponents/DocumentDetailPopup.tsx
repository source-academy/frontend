import { Button, Dialog, HTMLSelect, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    if (document) {
      setDraft(draftFrom(document));
      setMode(initialMode);
    }
  }, [document?.id]);

  const dirty = useMemo(() => {
    if (!document || !draft) {
      return false;
    }
    const saved = draftFrom(document);
    return (
      saved.title !== draft.title ||
      saved.description !== draft.description ||
      saved.releaseDate !== draft.releaseDate ||
      saved.categoryId !== draft.categoryId
    );
  }, [document, draft]);

  const categoryOptions = useMemo(
    () => categories.map(c => ({ value: c.id, label: c.name })),
    [categories],
  );

  if (!document || !draft) {
    return null;
  }

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
      isOpen
      onClose={onClose}
      style={{
        width: 'min(680px, 94vw)',
        maxHeight: 'min(760px, 88vh)',
        padding: 0,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid #dce0e5',
          flex: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          {mode === 'edit' ? (
            <span className={classes.popupTitle}>Edit document</span>
          ) : (
            <span className={classes.popupTitle}>{document.title}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          {mode === 'view' && (
            <Button small icon={IconNames.EDIT} text="Edit" onClick={() => setMode('edit')} />
          )}
          <button
            type="button"
            className={classes.iconButton}
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon icon={IconNames.CROSS} size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 16px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={classes.formGroup}>
            <label className={classes.formLabel}>Title</label>
            <input
              className={classes.formInput}
              value={draft.title}
              disabled={readOnly}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              style={readOnly ? { background: '#f4f4f7' } : undefined}
            />
          </div>
          <div className={classes.formRow2}>
            <div className={classes.formGroup}>
              <label className={classes.formLabel}>Category</label>
              <HTMLSelect
                className={classes.formSelect}
                fill
                disabled={readOnly}
                value={draft.categoryId}
                onChange={e => setDraft({ ...draft, categoryId: Number(e.target.value) })}
                options={categoryOptions}
              />
            </div>
            <div className={classes.formGroup}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
              >
                <label className={classes.formLabel}>Release date {!readOnly && '*'}</label>
                <span style={{ fontSize: 11, color: '#5f6b7c' }}>{status}</span>
              </div>
              <input
                type="date"
                className={classes.formInput}
                disabled={readOnly}
                value={draft.releaseDate ?? ''}
                onChange={e => setDraft({ ...draft, releaseDate: e.target.value || null })}
                style={
                  readOnly
                    ? { background: '#f4f4f7' }
                    : !draft.releaseDate
                      ? { borderColor: '#cd4246' }
                      : undefined
                }
              />
              {readOnly && (
                <span style={{ fontSize: 11.5, color: '#738091' }}>
                  {formatReleaseDate(draft.releaseDate)}
                </span>
              )}
              {!readOnly && !draft.releaseDate && (
                <span style={{ fontSize: 11.5, color: '#cd4246' }}>
                  Select a release date before this document can be saved.
                </span>
              )}
            </div>
          </div>
          <div className={classes.formGroup}>
            <label className={classes.formLabel}>Summary</label>
            <textarea
              className={classes.formTextarea}
              rows={4}
              disabled={readOnly}
              value={draft.description}
              onChange={e => setDraft({ ...draft, description: e.target.value })}
              style={readOnly ? { background: '#f4f4f7' } : undefined}
            />
          </div>
        </div>
      </div>

      {mode === 'edit' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            height: 56,
            padding: '0 16px',
            borderTop: '1px solid #dce0e5',
            background: '#fbfbfd',
            flex: 'none',
          }}
        >
          <Button
            minimal
            intent="danger"
            icon={IconNames.TRASH}
            text="Delete document"
            onClick={onDeleteRequested}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button text="Cancel" onClick={handleCancelEdit} />
            <Button
              intent={dirty && !!draft.releaseDate ? 'primary' : 'none'}
              text="Save changes"
              disabled={!dirty || !draft.releaseDate || isSaving}
              loading={isSaving}
              onClick={handleSave}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default DocumentDetailPopup;
