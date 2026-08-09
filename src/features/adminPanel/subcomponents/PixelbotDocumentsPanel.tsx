import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  H4,
  Icon,
  InputGroup,
  Intent,
  Popover,
  Position,
  TextArea,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const documentsByCategory = useMemo(() => {
    const map = new Map<number, PixelbotDocument[]>();
    documents.forEach(doc => {
      const list = map.get(doc.categoryId) ?? [];
      list.push(doc);
      map.set(doc.categoryId, list);
    });
    return map;
  }, [documents]);

  const toggleCategoryOpen = (categoryId: number) => {
    setOpenCategoryIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const startRenameCategory = (e: React.MouseEvent, category: PixelbotCategory) => {
    e.stopPropagation();
    setRenamingCategoryId(category.id);
    setRenameDraft(category.name);
  };

  const commitRenameCategory = async () => {
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
  };

  const handleDeleteCategory = async (e: React.MouseEvent, category: PixelbotCategory) => {
    e.stopPropagation();
    const count = documentsByCategory.get(category.id)?.length ?? 0;
    if (count > 0) {
      showDangerMessage(
        `"${category.name}" still contains ${count} document${count === 1 ? '' : 's'}. Move or delete them first.`,
        4000,
      );
      return;
    }
    if (await deletePixelbotCategory(category.id, tokens)) await refresh();
  };

  const commitNewCategory = async () => {
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
  };

  const handleDeleteDocument = async () => {
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
  };

  const handleOpenMapPreview = async () => {
    setMapPreviewOpen(true);
    const data = await getPixelbotDocumentMapPreview(tokens);
    setMapPreview(data ? JSON.stringify(data, null, 2) : 'Failed to load document map.');
  };

  const confirmDeleteTitle = documents.find(d => d.id === confirmDeleteId)?.title ?? '';

  return (
    <div className={classes.directory}>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <H4>Document Directory</H4>
          <Popover
            position={Position.BOTTOM_LEFT}
            content={
              <div className={classes.infoPopover}>
                Documents are available to Pixel after their release date.
              </div>
            }
          >
            <Button minimal small icon={IconNames.INFO_SIGN} aria-label="About this screen" />
          </Popover>
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

      {loadError && <Callout intent={Intent.DANGER}>{loadError}</Callout>}

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
                  <InputGroup
                    small
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
                  <Button
                    minimal
                    small
                    icon={IconNames.EDIT}
                    onClick={e => startRenameCategory(e, category)}
                    aria-label="Rename category"
                  />
                  <Button
                    minimal
                    small
                    icon={IconNames.TRASH}
                    intent={Intent.DANGER}
                    onClick={e => handleDeleteCategory(e, category)}
                    aria-label="Delete category"
                  />
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
                        <Button
                          minimal
                          small
                          icon={IconNames.EYE_OPEN}
                          onClick={() => setDetail({ documentId: doc.id, mode: 'view' })}
                          aria-label="View document"
                        />
                        <Button
                          minimal
                          small
                          icon={IconNames.EDIT}
                          onClick={() => setDetail({ documentId: doc.id, mode: 'edit' })}
                          aria-label="Edit document"
                        />
                        <Button
                          minimal
                          small
                          icon={IconNames.TRASH}
                          intent={Intent.DANGER}
                          onClick={() => setConfirmDeleteId(doc.id)}
                          aria-label="Delete document"
                        />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {newCategoryActive ? (
          <InputGroup
            className={classes.newCategoryInput}
            leftIcon={IconNames.PLUS}
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
        ) : (
          <Button
            fill
            outlined
            alignText="left"
            className={classes.newCategoryButton}
            icon={IconNames.PLUS}
            text="New category"
            onClick={() => {
              setNewCategoryActive(true);
              setNewCategoryName('');
            }}
          />
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
          key={detail.documentId}
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
