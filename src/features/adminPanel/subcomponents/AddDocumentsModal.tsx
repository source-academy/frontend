import {
  Button,
  Callout,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  Icon,
  InputGroup,
  Intent,
  Spinner,
  Switch,
  TextArea,
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

const todayIso = () => new Date().toISOString().slice(0, 10);

type BatchFile = {
  id: string;
  file: File;
  name: string;
  categoryId: number;
  categoryChosen: boolean;
  phase: 'uploading' | 'ready' | 'error';
  title: string;
  description: string;
  releaseDate: string | null;
  releaseNow: boolean;
  s3Key?: string;
  mediaType?: string;
  errorMessage?: string;
};

let uid = 0;
const nid = () => `f-${++uid}`;

type Props = {
  isOpen: boolean;
  categories: PixelbotCategory[];
  defaultCategoryId: number | null;
  tokens: Tokens;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

function AddDocumentsModal({
  isOpen,
  categories,
  defaultCategoryId,
  tokens,
  onClose,
  onSaved,
}: Props) {
  const [batch, setBatch] = useState<BatchFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selected = batch.find(f => f.id === selectedFileId) ?? null;

  const runUpload = async (files: BatchFile[]) => {
    if (files.length === 0) return;

    const entries = await uploadPixelbotDocuments(
      files[0].categoryId,
      files.map(f => f.file),
      tokens,
    );
    setBatch(prev =>
      prev.map(file => {
        const index = files.findIndex(uploaded => uploaded.id === file.id);
        if (index < 0) return file;
        const match = entries?.[index];
        if (!match)
          return { ...file, phase: 'error', errorMessage: 'Upload failed. Please retry.' };
        if (match.status === 'error') return { ...file, phase: 'error', errorMessage: match.error };
        return {
          ...file,
          phase: 'ready',
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
    const categoryId = defaultCategoryId ?? categories[0]?.id;
    if (!categoryId) return;

    const newFiles: BatchFile[] = files.map(file => ({
      id: nid(),
      file,
      name: file.name,
      categoryId,
      categoryChosen: defaultCategoryId !== null,
      phase: 'uploading',
      title: '',
      description: '',
      releaseDate: null,
      releaseNow: false,
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
  });

  const patchSelected = (patch: Partial<BatchFile>) => {
    if (selected) setBatch(prev => prev.map(f => (f.id === selected.id ? { ...f, ...patch } : f)));
  };

  const removeFile = (id: string) => {
    setBatch(prev => {
      const next = prev.filter(f => f.id !== id);
      setSelectedFileId(sel => (sel === id ? (next[0]?.id ?? null) : sel));
      return next;
    });
  };

  const retryFile = (file: BatchFile) => {
    setBatch(prev =>
      prev.map(f => (f.id === file.id ? { ...f, phase: 'uploading', errorMessage: undefined } : f)),
    );
    runUpload([file]);
  };

  const hasReleaseDate = (f: BatchFile) => f.releaseNow || !!f.releaseDate;
  const isComplete = (f: BatchFile) => f.categoryChosen && hasReleaseDate(f);

  const readyCount = batch.filter(f => f.phase === 'ready').length;
  const readyToSaveCount = batch.filter(f => f.phase === 'ready' && isComplete(f)).length;
  const allProcessed = batch.length > 0 && readyCount === batch.length;
  const allReady = batch.length > 0 && readyToSaveCount === batch.length;
  const missingReleaseDate = selected?.phase === 'ready' && !hasReleaseDate(selected);
  const missingCategory = selected?.phase === 'ready' && !selected.categoryChosen;

  const handleClose = () => {
    setBatch([]);
    setSelectedFileId(null);
    onClose();
  };

  const handleSaveAll = async () => {
    if (!allReady) return;
    setIsSaving(true);
    const entries: PixelbotDocumentSaveEntry[] = batch.map(f => ({
      categoryId: f.categoryId,
      title: f.title,
      description: f.description,
      releaseDate: f.releaseNow ? todayIso() : f.releaseDate,
      s3Key: f.s3Key,
      filename: f.name,
      mediaType: f.mediaType,
    }));
    const result = await savePixelbotDocuments(entries, tokens);
    setIsSaving(false);
    if (result) {
      await onSaved();
      handleClose();
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

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
            <span className={classes.dropzoneLabel}>
              {categories.length === 0
                ? 'Create a category first'
                : 'Drop files or click to browse'}
            </span>
          </div>

          <div className={classes.batchLabelRow}>
            <span className={classes.batchLabel}>This batch</span>
            <span className={classes.batchReadyCount}>
              {readyCount} of {batch.length} ready
            </span>
          </div>

          <div className={classes.batchList}>
            {batch.map(f => (
              <div
                key={f.id}
                className={classNames(
                  classes.fileItem,
                  f.id === selectedFileId && classes.fileItemActive,
                )}
                onClick={() => setSelectedFileId(f.id)}
              >
                <Icon
                  icon={IconNames.DOCUMENT}
                  intent={f.phase === 'error' ? Intent.DANGER : Intent.NONE}
                />
                <div className={classes.fileMeta}>
                  <span className={classes.fileName}>{f.name}</span>
                  {f.phase === 'uploading' && (
                    <span className={classes.fileStateLabel}>
                      <Spinner size={12} /> Uploading &amp; analyzing…
                    </span>
                  )}
                  {f.phase === 'ready' && isComplete(f) && (
                    <span className={classes.readyState}>
                      <Icon icon={IconNames.TICK} size={11} />
                      Ready
                    </span>
                  )}
                  {f.phase === 'ready' && !f.categoryChosen && (
                    <span className={classes.errorState}>Needs a category</span>
                  )}
                  {f.phase === 'ready' && f.categoryChosen && !hasReleaseDate(f) && (
                    <span className={classes.errorState}>Needs a release date</span>
                  )}
                  {f.phase === 'error' && (
                    <span className={classes.errorState}>
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
        </div>

        <div className={classes.formPane}>
          {!selected && (
            <div className={classes.emptyFormPane}>
              Add a file to start building its document map.
            </div>
          )}

          {selected?.phase === 'uploading' && (
            <div className={classes.loadingState}>
              <Spinner />
              <span>Reading document and drafting the map…</span>
            </div>
          )}

          {selected?.phase === 'error' && (
            <Callout intent={Intent.DANGER} title="This file couldn't be processed">
              <p>
                Pixel couldn&apos;t process {selected.name}. {selected.errorMessage}
              </p>
              <Button small text="Retry processing" onClick={() => retryFile(selected)} />
            </Callout>
          )}

          {selected?.phase === 'ready' && (
            <div className={classes.formStack}>
              <FormGroup label="Title">
                <InputGroup
                  value={selected.title}
                  onChange={e => patchSelected({ title: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="Summary">
                <TextArea
                  fill
                  rows={5}
                  value={selected.description}
                  onChange={e => patchSelected({ description: e.target.value })}
                />
              </FormGroup>
              <div className={classes.formRow2}>
                <FormGroup
                  label="Category *"
                  intent={missingCategory ? Intent.DANGER : Intent.NONE}
                  helperText={
                    missingCategory ? 'Select a category before this document can be saved.' : null
                  }
                >
                  <HTMLSelect
                    fill
                    value={selected.categoryChosen ? selected.categoryId : ''}
                    onChange={e =>
                      patchSelected({ categoryId: Number(e.target.value), categoryChosen: true })
                    }
                    options={[
                      { value: '', label: 'Select a category', disabled: true },
                      ...categoryOptions,
                    ]}
                  />
                </FormGroup>
                <FormGroup
                  label="Release date *"
                  intent={missingReleaseDate ? Intent.DANGER : Intent.NONE}
                  helperText={
                    missingReleaseDate
                      ? 'Select a release date before this document can be saved.'
                      : null
                  }
                >
                  <Switch
                    checked={selected.releaseNow}
                    label="Release immediately"
                    onChange={() => patchSelected({ releaseNow: !selected.releaseNow })}
                  />
                  <input
                    type="date"
                    className={classNames(Classes.INPUT, Classes.FILL)}
                    value={selected.releaseNow ? todayIso() : (selected.releaseDate ?? '')}
                    disabled={selected.releaseNow}
                    onChange={e => patchSelected({ releaseDate: e.target.value || null })}
                    aria-invalid={missingReleaseDate}
                  />
                </FormGroup>
              </div>
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter
        actions={
          <>
            <Button text="Cancel" onClick={handleClose} />
            <Button
              intent={allReady ? Intent.PRIMARY : Intent.NONE}
              text={
                allReady
                  ? 'Save all documents'
                  : `Save all documents (${readyToSaveCount}/${batch.length})`
              }
              disabled={!allReady || isSaving}
              loading={isSaving}
              onClick={handleSaveAll}
            />
          </>
        }
      >
        <span className={classes.footerStatus}>
          {allProcessed
            ? `${readyToSaveCount} of ${batch.length} have a category and release date`
            : `${readyCount} of ${batch.length} ready`}
        </span>
      </DialogFooter>
    </Dialog>
  );
}

export default AddDocumentsModal;
