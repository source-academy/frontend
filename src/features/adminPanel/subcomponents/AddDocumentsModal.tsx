import { Button, Dialog, HTMLSelect, Icon, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import type { DropEvent, FileRejection } from 'react-dropzone';
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
  ext: string;
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

  const runUpload = useCallback(
    async (files: BatchFile[]) => {
      if (files.length === 0) {
        return;
      }
      const categoryId = files[0].categoryId;
      const entries = await uploadPixelbotDocuments(
        categoryId,
        files.map(f => f.file),
        tokens,
      );
      setBatch(prev =>
        prev.map(f => {
          // Match by position within this upload batch, not by filename — two files with the
          // same name (e.g. two "report.pdf") would otherwise both resolve to the first entry.
          // The backend preserves input order in its response, so index lookup is exact.
          const index = files.findIndex(uploaded => uploaded.id === f.id);
          if (index === -1) {
            return f;
          }
          const match = entries?.[index];
          if (!match) {
            return { ...f, phase: 'error', errorMessage: 'Upload failed. Please retry.' };
          }
          if (match.status === 'error') {
            return { ...f, phase: 'error', errorMessage: match.error };
          }
          return {
            ...f,
            phase: 'ready',
            title: match.title,
            description: match.description,
            releaseDate: match.releaseDate,
            s3Key: match.s3Key,
            mediaType: match.mediaType,
          };
        }),
      );
    },
    [tokens],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const categoryId = defaultCategoryId ?? categories[0]?.id;
      if (!categoryId) {
        return;
      }
      const newFiles: BatchFile[] = files.map(file => ({
        id: nid(),
        file,
        name: file.name,
        ext: (file.name.split('.').pop() ?? 'file').slice(0, 3).toUpperCase(),
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
    },
    [defaultCategoryId, categories, runUpload],
  );

  const onDropAccepted = useCallback(
    (files: File[], _event: DropEvent) => addFiles(files),
    [addFiles],
  );
  const onDropRejected = useCallback((_rejections: FileRejection[]) => {}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: ACCEPTED_MIME_TYPES,
    disabled: categories.length === 0,
    onDropAccepted,
    onDropRejected,
  });

  const patchSelected = useCallback(
    (patch: Partial<BatchFile>) => {
      if (!selected) {
        return;
      }
      setBatch(prev => prev.map(f => (f.id === selected.id ? { ...f, ...patch } : f)));
    },
    [selected],
  );

  const removeFile = useCallback((id: string) => {
    setBatch(prev => {
      const next = prev.filter(f => f.id !== id);
      setSelectedFileId(sel => (sel === id ? (next[0]?.id ?? null) : sel));
      return next;
    });
  }, []);

  const retryFile = useCallback(
    (file: BatchFile) => {
      setBatch(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, phase: 'uploading', errorMessage: undefined } : f,
        ),
      );
      runUpload([file]);
    },
    [runUpload],
  );

  const hasReleaseDate = (f: BatchFile) => f.releaseNow || !!f.releaseDate;
  const isComplete = (f: BatchFile) => f.categoryChosen && hasReleaseDate(f);

  const readyCount = batch.filter(f => f.phase === 'ready').length;
  const readyToSaveCount = batch.filter(f => f.phase === 'ready' && isComplete(f)).length;
  const allProcessed = batch.length > 0 && readyCount === batch.length;
  const allReady = batch.length > 0 && readyToSaveCount === batch.length;
  const missingReleaseDate = selected?.phase === 'ready' && !hasReleaseDate(selected);
  const missingCategory = selected?.phase === 'ready' && !selected.categoryChosen;

  const handleClose = useCallback(() => {
    setBatch([]);
    setSelectedFileId(null);
    onClose();
  }, [onClose]);

  const handleSaveAll = useCallback(async () => {
    if (!allReady) {
      return;
    }
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
  }, [allReady, batch, tokens, onSaved, handleClose]);

  const categoryOptions = useMemo(
    () => categories.map(c => ({ value: c.id, label: c.name })),
    [categories],
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      canOutsideClickClose={false}
      style={{
        width: 'min(1080px, 96vw)',
        height: 'min(700px, 90vh)',
        maxWidth: 'min(1080px, 96vw)',
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
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 46,
          padding: '0 14px',
          borderBottom: '1px solid #dce0e5',
          flex: 'none',
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 620, letterSpacing: '-0.005em' }}>
          Add documents
        </span>
        <button
          type="button"
          className={classes.iconButton}
          onClick={handleClose}
          aria-label="Close"
        >
          <Icon icon={IconNames.CROSS} size={14} />
        </button>
      </div>

      <div className={classes.modalBody}>
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
                <span
                  className={classNames(
                    classes.fileIconChip,
                    f.phase === 'error' && classes.fileIconChipError,
                  )}
                >
                  {f.ext}
                </span>
                <div className={classes.fileMeta}>
                  <span className={classes.fileName}>{f.name}</span>
                  {f.phase === 'uploading' && (
                    <>
                      <div className={classes.shimmerBar} />
                      <span className={classes.fileStateLabel}>Uploading &amp; analyzing…</span>
                    </>
                  )}
                  {f.phase === 'ready' && isComplete(f) && (
                    <span className={classes.readyState}>
                      <Icon icon={IconNames.TICK} size={11} />
                      Ready
                    </span>
                  )}
                  {f.phase === 'ready' && !f.categoryChosen && (
                    <span className={classes.fileStateLabel} style={{ color: '#cd4246' }}>
                      Needs a category
                    </span>
                  )}
                  {f.phase === 'ready' && f.categoryChosen && !hasReleaseDate(f) && (
                    <span className={classes.fileStateLabel} style={{ color: '#cd4246' }}>
                      Needs a release date
                    </span>
                  )}
                  {f.phase === 'error' && (
                    <span className={classes.errorState}>
                      Couldn&apos;t process file
                      <button
                        type="button"
                        className={classes.retryLink}
                        onClick={e => {
                          e.stopPropagation();
                          retryFile(f);
                        }}
                      >
                        Retry
                      </button>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={classes.removeButton}
                  onClick={e => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  aria-label="Remove from batch"
                >
                  <Icon icon={IconNames.CROSS} size={10} />
                </button>
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
            <div className={classes.skeletonStack}>
              <div className={classes.formGroup}>
                <div className={classes.skeletonLabel} />
                <div className={classes.skeletonField} />
              </div>
              <div className={classes.formGroup}>
                <div className={classes.skeletonLabel} />
                <div className={classNames(classes.skeletonField, classes.skeletonFieldTall)} />
              </div>
              <span className={classes.skeletonHint}>Reading document and drafting the map…</span>
            </div>
          )}

          {selected?.phase === 'error' && (
            <div className={classes.errorBlock}>
              <span className={classes.errorBlockTitle}>This file couldn&apos;t be processed</span>
              <span className={classes.errorBlockBody}>
                Pixel couldn&apos;t process {selected.name}. {selected.errorMessage}
              </span>
              <Button text="Retry processing" onClick={() => retryFile(selected)} />
            </div>
          )}

          {selected?.phase === 'ready' && (
            <div className={classes.formStack}>
              <div className={classes.formGroup}>
                <label className={classes.formLabel}>Title</label>
                <input
                  className={classes.formInput}
                  value={selected.title}
                  onChange={e => patchSelected({ title: e.target.value })}
                />
              </div>
              <div className={classes.formGroup}>
                <label className={classes.formLabel}>Summary</label>
                <textarea
                  className={classes.formTextarea}
                  rows={5}
                  value={selected.description}
                  onChange={e => patchSelected({ description: e.target.value })}
                />
              </div>
              <div className={classes.formRow2}>
                <div className={classes.formGroup}>
                  <label className={classes.formLabel}>Category *</label>
                  <HTMLSelect
                    className={classNames(
                      classes.formSelect,
                      missingCategory && classes.formFieldError,
                    )}
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
                  {missingCategory && (
                    <span style={{ fontSize: 11.5, color: '#cd4246' }}>
                      Select a category before this document can be saved.
                    </span>
                  )}
                </div>
                <div className={classes.formGroup}>
                  <div className={classes.releaseRow}>
                    <label className={classes.formLabel}>Release date *</label>
                    <button
                      type="button"
                      className={classes.releaseToggle}
                      onClick={() => patchSelected({ releaseNow: !selected.releaseNow })}
                    >
                      Release immediately
                      <span
                        className={classNames(
                          classes.toggleTrack,
                          selected.releaseNow && classes.toggleTrackOn,
                        )}
                      >
                        <span
                          className={classNames(
                            classes.toggleKnob,
                            selected.releaseNow && classes.toggleKnobOn,
                          )}
                        />
                      </span>
                    </button>
                  </div>
                  <input
                    type="date"
                    className={classes.formInput}
                    value={selected.releaseNow ? todayIso() : (selected.releaseDate ?? '')}
                    disabled={selected.releaseNow}
                    onChange={e => patchSelected({ releaseDate: e.target.value || null })}
                    style={missingReleaseDate ? { borderColor: '#cd4246' } : undefined}
                  />
                  {missingReleaseDate && (
                    <span style={{ fontSize: 11.5, color: '#cd4246' }}>
                      Select a release date before this document can be saved.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          height: 54,
          padding: '0 14px',
          borderTop: '1px solid #dce0e5',
          background: '#fbfbfd',
          flex: 'none',
        }}
      >
        <span style={{ fontSize: 11.5, color: '#5f6b7c' }}>
          {allProcessed
            ? `${readyToSaveCount} of ${batch.length} have a category and release date`
            : `${readyCount} of ${batch.length} ready`}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
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
        </div>
      </div>
    </Dialog>
  );
}

export default AddDocumentsModal;
