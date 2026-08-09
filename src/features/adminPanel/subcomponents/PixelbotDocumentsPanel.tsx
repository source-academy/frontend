import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
  Intent,
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from 'src/commons/utils/Hooks';

import type { Tokens } from '../../../commons/application/types/SessionTypes';
import {
  createPixelbotCategory,
  deletePixelbotCategory,
  deletePixelbotDocument,
  getPixelbotDocumentMapPreview,
  getPixelbotDocuments,
  renamePixelbotCategory,
} from '../../../commons/sagas/RequestsSaga';
import { showDangerMessage } from '../../../commons/utils/notifications/NotificationsHelper';
import AddDocumentsModal from './AddDocumentsModal';
import DocumentDetailPopup from './DocumentDetailPopup';
import classes from './DocumentDirectory.module.css';
import type { PixelbotCategory, PixelbotDocument } from './PixelbotDocumentsTypes';
import { formatReleaseDate, pixelbotDocumentStatus } from './PixelbotDocumentsTypes';

type DetailState = { documentId: number; mode: 'view' | 'edit' };

function PixelbotDocumentsPanel() {
  const accessToken = useAppSelector(state => state.session.accessToken);
  const refreshToken = useAppSelector(state => state.session.refreshToken);
  const tokens = useMemo(
    () => ({ accessToken, refreshToken }) as Tokens,
    [accessToken, refreshToken],
  );

  const [categories, setCategories] = useState<PixelbotCategory[]>([]);
  const [documents, setDocuments] = useState<PixelbotDocument[]>([]);
  const [loadError, setLoadError] = useState('');

  const [infoOpen, setInfoOpen] = useState(false);
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<number>>(new Set());
  const [renamingCategoryId, setRenamingCategoryId] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [newCategoryActive, setNewCategoryActive] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCategoryId, setAddModalCategoryId] = useState<number | null>(null);
  const [mapPreviewOpen, setMapPreviewOpen] = useState(false);
  const [mapPreview, setMapPreview] = useState('');

  const [detail, setDetail] = useState<DetailState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const infoRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!tokens.accessToken || !tokens.refreshToken) {
      return;
    }
    const data = await getPixelbotDocuments(tokens);
    if (data) {
      setCategories(data.categories);
      setDocuments(data.documents);
      setLoadError('');
    } else {
      setLoadError('Failed to load pixelbot documents.');
    }
  }, [tokens]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!infoOpen) {
      return;
    }
    const onClickAway = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [infoOpen]);

  const documentsByCategory = useMemo(() => {
    const map = new Map<number, PixelbotDocument[]>();
    documents.forEach(doc => {
      const list = map.get(doc.categoryId) ?? [];
      list.push(doc);
      map.set(doc.categoryId, list);
    });
    return map;
  }, [documents]);

  const toggleCategoryOpen = useCallback((categoryId: number) => {
    setOpenCategoryIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const startRenameCategory = useCallback((e: React.MouseEvent, category: PixelbotCategory) => {
    e.stopPropagation();
    setRenamingCategoryId(category.id);
    setRenameDraft(category.name);
  }, []);

  const commitRenameCategory = useCallback(async () => {
    if (renamingCategoryId === null) {
      return;
    }
    const name = renameDraft.trim();
    const categoryId = renamingCategoryId;
    setRenamingCategoryId(null);
    if (!name) {
      return;
    }
    const renamed = await renamePixelbotCategory(categoryId, name, tokens);
    if (renamed) {
      await refresh();
    }
  }, [renamingCategoryId, renameDraft, tokens, refresh]);

  const handleDeleteCategory = useCallback(
    async (e: React.MouseEvent, category: PixelbotCategory) => {
      e.stopPropagation();
      const count = documentsByCategory.get(category.id)?.length ?? 0;
      if (count > 0) {
        showDangerMessage(
          `"${category.name}" still contains ${count} document${count === 1 ? '' : 's'}. Move or delete them first.`,
          4000,
        );
        return;
      }
      const ok = await deletePixelbotCategory(category.id, tokens);
      if (ok) {
        await refresh();
      }
    },
    [documentsByCategory, tokens, refresh],
  );

  const commitNewCategory = useCallback(async () => {
    const name = newCategoryName.trim();
    setNewCategoryActive(false);
    setNewCategoryName('');
    if (!name) {
      return;
    }
    const category = await createPixelbotCategory(name, tokens);
    if (category) {
      await refresh();
    }
  }, [newCategoryName, tokens, refresh]);

  const handleDeleteDocument = useCallback(async () => {
    if (confirmDeleteId === null) {
      return;
    }
    const ok = await deletePixelbotDocument(confirmDeleteId, tokens);
    setConfirmDeleteId(null);
    if (ok) {
      if (detail?.documentId === confirmDeleteId) {
        setDetail(null);
      }
      await refresh();
    }
  }, [confirmDeleteId, tokens, detail, refresh]);

  const handleOpenMapPreview = useCallback(async () => {
    setMapPreviewOpen(true);
    const data = await getPixelbotDocumentMapPreview(tokens);
    setMapPreview(data ? JSON.stringify(data, null, 2) : 'Failed to load document map.');
  }, [tokens]);

  const confirmDeleteTitle = documents.find(d => d.id === confirmDeleteId)?.title ?? '';

  return (
    <div className={classes.directory}>
      <div className={classes.header}>
        <div className={classes.headerLeft} ref={infoRef}>
          <h3 className={classes.headerTitle}>Document Directory</h3>
          <button
            type="button"
            className={classes.infoButton}
            onClick={() => setInfoOpen(prev => !prev)}
            aria-label="About this screen"
          >
            <Icon icon={IconNames.INFO_SIGN} size={13} />
          </button>
          {infoOpen && (
            <div className={classes.infoPopover}>
              Documents in this directory are indexed for Pixel&apos;s retrieval. Students only see
              a document once its release date has passed and its status is Live.
            </div>
          )}
        </div>
        <div className={classes.headerRight}>
          <Button
            minimal
            icon={IconNames.EYE_OPEN}
            text="View document map"
            onClick={handleOpenMapPreview}
          />
          <Button
            intent={Intent.PRIMARY}
            icon={IconNames.PLUS}
            text="Add documents"
            onClick={() => {
              setAddModalCategoryId(null);
              setAddModalOpen(true);
            }}
            disabled={categories.length === 0}
          />
        </div>
      </div>

      {loadError && <p className={classes.emptyRow}>{loadError}</p>}

      <div className={classes.list}>
        {categories.map(category => {
          const docs = documentsByCategory.get(category.id) ?? [];
          const isOpen = openCategoryIds.has(category.id);
          const isRenaming = renamingCategoryId === category.id;

          return (
            <div key={category.id} className={classes.categoryBlock}>
              <div className={classes.categoryRow} onClick={() => toggleCategoryOpen(category.id)}>
                <span className={classNames(classes.chevron, isOpen && classes.chevronOpen)}>
                  <Icon icon={IconNames.CHEVRON_RIGHT} size={12} />
                </span>
                {isRenaming ? (
                  <input
                    className={classes.categoryNameInput}
                    value={renameDraft}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onChange={e => setRenameDraft(e.target.value)}
                    onBlur={commitRenameCategory}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === 'Escape') {
                        setRenamingCategoryId(null);
                      }
                    }}
                  />
                ) : (
                  <span className={classes.categoryName}>{category.name}</span>
                )}
                <span className={classes.categoryCount}>
                  {docs.length === 1 ? '1 document' : `${docs.length} documents`}
                </span>
                <span className={classes.spacer} />
                <span className={classes.rowActions}>
                  <button
                    type="button"
                    className={classes.iconButton}
                    onClick={e => startRenameCategory(e, category)}
                    aria-label="Rename category"
                  >
                    <Icon icon={IconNames.EDIT} size={13} />
                  </button>
                  <button
                    type="button"
                    className={classNames(classes.iconButton, classes.iconButtonDanger)}
                    onClick={e => handleDeleteCategory(e, category)}
                    aria-label="Delete category"
                  >
                    <Icon icon={IconNames.TRASH} size={13} />
                  </button>
                </span>
              </div>

              {isOpen && docs.length > 0 && (
                <div className={classes.categoryBody}>
                  {docs.map(doc => (
                    <div key={doc.id} className={classes.docRow}>
                      <span className={classes.docTitle}>{doc.title}</span>
                      <span className={classes.docDate}>{formatReleaseDate(doc.releaseDate)}</span>
                      <span className={classes.docStatus}>
                        {pixelbotDocumentStatus(doc.releaseDate)}
                      </span>
                      <span className={classes.docActions}>
                        <button
                          type="button"
                          className={classes.iconButton}
                          onClick={() => setDetail({ documentId: doc.id, mode: 'view' })}
                          aria-label="View document"
                        >
                          <Icon icon={IconNames.EYE_OPEN} size={13} />
                        </button>
                        <button
                          type="button"
                          className={classes.iconButton}
                          onClick={() => setDetail({ documentId: doc.id, mode: 'edit' })}
                          aria-label="Edit document"
                        >
                          <Icon icon={IconNames.EDIT} size={13} />
                        </button>
                        <button
                          type="button"
                          className={classNames(classes.iconButton, classes.iconButtonDanger)}
                          onClick={() => setConfirmDeleteId(doc.id)}
                          aria-label="Delete document"
                        >
                          <Icon icon={IconNames.TRASH} size={13} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {newCategoryActive ? (
          <div className={classes.newCategoryActive}>
            <input
              className={classes.newCategoryInput}
              placeholder="Category name"
              autoFocus
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onBlur={commitNewCategory}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'Escape') {
                  setNewCategoryActive(false);
                  setNewCategoryName('');
                }
              }}
            />
            <span className={classes.newCategoryHint}>Enter to save · Esc to cancel</span>
          </div>
        ) : (
          <button
            type="button"
            className={classes.newCategoryRow}
            onClick={() => {
              setNewCategoryActive(true);
              setNewCategoryName('');
            }}
          >
            <Icon icon={IconNames.PLUS} size={13} />
            New category
          </button>
        )}
      </div>

      <AddDocumentsModal
        isOpen={addModalOpen}
        categories={categories}
        defaultCategoryId={addModalCategoryId}
        tokens={tokens}
        onClose={() => {
          setAddModalOpen(false);
          setAddModalCategoryId(null);
        }}
        onSaved={refresh}
      />

      {detail && (
        <DocumentDetailPopup
          document={documents.find(d => d.id === detail.documentId) ?? null}
          categories={categories}
          initialMode={detail.mode}
          tokens={tokens}
          onClose={() => setDetail(null)}
          onSaved={refresh}
          onDeleteRequested={() => setConfirmDeleteId(detail.documentId)}
        />
      )}

      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete this document?"
      >
        <DialogBody>
          <p>
            &ldquo;{confirmDeleteTitle}&rdquo; will be removed from the directory and de-indexed, so
            Pixel can no longer retrieve it. This can&apos;t be undone.
          </p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button text="Cancel" onClick={() => setConfirmDeleteId(null)} />
              <Button
                text="Delete document"
                intent={Intent.DANGER}
                onClick={handleDeleteDocument}
              />
            </>
          }
        />
      </Dialog>

      <Dialog
        isOpen={mapPreviewOpen}
        onClose={() => setMapPreviewOpen(false)}
        title="Document map"
        style={{ width: 'min(680px, 92vw)' }}
      >
        <DialogBody>
          <TextArea
            readOnly
            fill
            value={mapPreview}
            style={{ height: 400, fontFamily: 'monospace', fontSize: 12.5 }}
          />
        </DialogBody>
        <DialogFooter actions={<Button text="Close" onClick={() => setMapPreviewOpen(false)} />} />
      </Dialog>
    </div>
  );
}

export default PixelbotDocumentsPanel;
