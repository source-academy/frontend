import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
  Intent,
  Spinner,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import type { Tokens } from '../../../commons/application/types/SessionTypes';
import {
  savePixelbotDocuments,
  uploadPixelbotDocuments,
} from '../../../commons/sagas/RequestsSaga';
import { showDangerMessage } from '../../../commons/utils/notifications/NotificationsHelper';
import type { DocumentDraft } from './DocumentDetailPopup';
import { DocumentFields, isDraftComplete } from './DocumentDetailPopup';
import classes from './DocumentDirectory.module.css';
import type { PixelbotCategory, PixelbotDocumentSaveEntry } from './PixelbotDocumentsTypes';

const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/x-tex': ['.tex'],
  'application/xml': ['.xml'],
  'text/xml': ['.xml'],
};

const ACCEPTED_EXTENSIONS = [...new Set(Object.values(ACCEPTED_MIME_TYPES).flat())].join(', ');

type BatchFile = DocumentDraft & {
  id: string;
  file: File;
  phase: 'uploading' | 'ready' | 'error';
  s3Key?: string;
  mediaType?: string;
  errorMessage?: string;
};

let uid = 0;
const nid = () => `f-${++uid}`;

type Props = {
  isOpen: boolean;
  categories: PixelbotCategory[];
  tokens: Tokens;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

function AddDocumentsModal({ isOpen, categories, tokens, onClose, onSaved }: Props) {
  const [batch, setBatch] = useState<BatchFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selected = batch.find(f => f.id === selectedFileId) ?? null;

  // The upload endpoint needs a category up front; the one that actually sticks is chosen on save.
  const uploadCategoryId = categories[0]?.id;

  const runUpload = async (files: BatchFile[]) => {
    if (files.length === 0) {
      return;
    }
    const entries = await uploadPixelbotDocuments(
      uploadCategoryId!,
      files.map(f => f.file),
      tokens,
    ).catch(() => null);
    setBatch(prev =>
      prev.map(file => {
        const index = files.findIndex(uploaded => uploaded.id === file.id);
        if (index < 0) {
          return file;
        }
        const match = entries?.length === files.length ? entries[index] : undefined;
        if (!match || match.status === 'error') {
          return {
            ...file,
            phase: 'error' as const,
            errorMessage: match?.status === 'error' ? match.error : 'Upload failed. Please retry.',
          };
        }
        return {
          ...file,
          phase: 'ready' as const,
          title: match.title,
          description: match.description,
          releaseDate: match.releaseDate,
          s3Key: match.s3Key,
          mediaType: match.mediaType,
        };
      }),
    );
  };

  const addFiles = (files: File[]) => {
    if (!uploadCategoryId) {
      return;
    }
    const newFiles: BatchFile[] = files.map(file => ({
      id: nid(),
      file,
      categoryId: null,
      phase: 'uploading',
      title: '',
      description: '',
      releaseDate: null,
    }));
    setBatch(prev => [...prev, ...newFiles]);
    setSelectedFileId(prev => prev ?? newFiles[0]?.id ?? null);
    runUpload(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: ACCEPTED_MIME_TYPES,
    disabled: categories.length === 0,
    onDropAccepted: addFiles,
    onDropRejected: rejected =>
      showDangerMessage(
        `Couldn't add ${rejected.map(r => r.file.name).join(', ')}. Accepted file types: ${ACCEPTED_EXTENSIONS}.`,
        4000,
      ),
  });

  const patchFile = (id: string, patch: Partial<BatchFile>) =>
    setBatch(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));

  const removeFile = (id: string) => {
    const next = batch.filter(f => f.id !== id);
    setBatch(next);
    if (selectedFileId === id) {
      setSelectedFileId(next[0]?.id ?? null);
    }
  };

  const retryFile = (file: BatchFile) => {
    patchFile(file.id, { phase: 'uploading', errorMessage: undefined });
    runUpload([file]);
  };

  const readyCount = batch.filter(f => f.phase === 'ready').length;
  const savableCount = batch.filter(f => f.phase === 'ready' && isDraftComplete(f)).length;
  const allReady = batch.length > 0 && savableCount === batch.length;

  const handleClose = () => {
    setBatch([]);
    setSelectedFileId(null);
    onClose();
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const entries: PixelbotDocumentSaveEntry[] = batch.map(f => ({
      categoryId: f.categoryId!,
      title: f.title,
      description: f.description,
      releaseDate: f.releaseDate,
      s3Key: f.s3Key,
      filename: f.file.name,
      mediaType: f.mediaType,
    }));
    try {
      const result = await savePixelbotDocuments(entries, tokens);
      if (result) {
        await onSaved();
        handleClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      className={classes.uploadDialog}
      isOpen={isOpen}
      onClose={handleClose}
      canOutsideClickClose={false}
      title="Add documents"
    >
      <DialogBody className={classes.modalBody}>
        <div className={classes.uploadPane}>
          <div
            {...getRootProps()}
            className={classNames(
              classes.dropzone,
              isDragActive && classes.dropzoneDragging,
              categories.length === 0 && classes.dropzoneDisabled,
            )}
          >
            <input {...getInputProps()} />
            <Icon icon={IconNames.UPLOAD} size={18} />
            <span className={classes.muted}>
              {categories.length === 0
                ? 'Create a category first'
                : 'Drop files or click to browse'}
            </span>
          </div>

          <span className={classes.muted}>
            This batch — {readyCount} of {batch.length} processed
          </span>

          {batch.map(f => (
            <div
              key={f.id}
              className={classNames(
                classes.fileItem,
                f.id === selectedFileId && classes.fileItemActive,
              )}
              onClick={() => setSelectedFileId(f.id)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedFileId(f.id);
                }
              }}
            >
              <Icon
                icon={IconNames.DOCUMENT}
                intent={f.phase === 'error' ? Intent.DANGER : Intent.NONE}
              />
              <div className={classes.fileMeta}>
                <div>{f.file.name}</div>
                {f.phase === 'uploading' && (
                  <span className={classNames(classes.stateLabel, classes.muted)}>
                    <Spinner size={12} /> Uploading &amp; analyzing…
                  </span>
                )}
                {f.phase === 'ready' && (
                  <span
                    className={classNames(
                      classes.stateLabel,
                      isDraftComplete(f) ? classes.ok : classes.err,
                    )}
                  >
                    {isDraftComplete(f) ? 'Ready' : 'Needs a category and release date'}
                  </span>
                )}
                {f.phase === 'error' && (
                  <span className={classNames(classes.stateLabel, classes.err)}>
                    Couldn&apos;t process file
                    <Button
                      minimal
                      small
                      intent={Intent.DANGER}
                      text="Retry"
                      onClick={e => {
                        e.stopPropagation();
                        retryFile(f);
                      }}
                    />
                  </span>
                )}
              </div>
              <Button
                minimal
                small
                icon={IconNames.CROSS}
                onClick={e => {
                  e.stopPropagation();
                  removeFile(f.id);
                }}
                aria-label="Remove from batch"
              />
            </div>
          ))}
        </div>

        <div className={classes.formPane}>
          {!selected && (
            <div className={classNames(classes.emptyPane, classes.muted)}>
              Add a file to start building its document map.
            </div>
          )}
          {selected?.phase === 'uploading' && (
            <div className={classes.emptyPane}>
              <Spinner />
            </div>
          )}
          {selected?.phase === 'error' && (
            <Callout intent={Intent.DANGER} title="This file couldn't be processed">
              <p>{selected.errorMessage}</p>
              <Button small text="Retry processing" onClick={() => retryFile(selected)} />
            </Callout>
          )}
          {selected?.phase === 'ready' && (
            <DocumentFields
              draft={selected}
              categories={categories}
              onChange={patch => patchFile(selected.id, patch)}
            />
          )}
        </div>
      </DialogBody>

      <DialogFooter
        actions={
          <>
            <Button text="Cancel" onClick={handleClose} />
            <Button
              intent={allReady ? Intent.PRIMARY : Intent.NONE}
              text={`Save all documents (${savableCount}/${batch.length})`}
              disabled={!allReady || isSaving}
              loading={isSaving}
              onClick={handleSaveAll}
            />
          </>
        }
      />
    </Dialog>
  );
}

export default AddDocumentsModal;
