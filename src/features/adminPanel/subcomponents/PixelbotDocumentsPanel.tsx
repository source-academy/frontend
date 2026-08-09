import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  H4,
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
import { showSimpleConfirmDialog } from '../../../commons/utils/DialogHelper';
import { showDangerMessage } from '../../../commons/utils/notifications/NotificationsHelper';
import AddDocumentsModal from './AddDocumentsModal';
import DocumentDetailPopup from './DocumentDetailPopup';
import classes from './DocumentDirectory.module.css';
import type { PixelbotCategory, PixelbotDocument } from './PixelbotDocumentsTypes';
import { formatReleaseDate, pixelbotDocumentStatus } from './PixelbotDocumentsTypes';

/** Commits an inline name input on Enter / cancels on Escape. */
const inlineInputKeys = (cancel: () => void) => (e: React.KeyboardEvent) => {
  if ((e.nativeEvent as KeyboardEvent).isComposing) {
    return;
  }
  if (e.key === 'Enter') {
    (e.target as HTMLInputElement).blur();
  }
  if (e.key === 'Escape') {
    cancel();
  }
};

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
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

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
    documents.forEach(doc => map.set(doc.categoryId, [...(map.get(doc.categoryId) ?? []), doc]));
    return map;
  }, [documents]);

  const toggleCategoryOpen = (categoryId: number) =>
    setOpenCategoryIds(prev => {
      const next = new Set(prev);
      if (!next.delete(categoryId)) {
        next.add(categoryId);
      }
      return next;
    });

  const commitRenameCategory = async () => {
    const name = renameDraft.trim();
    const categoryId = renamingCategoryId;
    setRenamingCategoryId(null);
    if (categoryId !== null && name && (await renamePixelbotCategory(categoryId, name, tokens))) {
      await refresh();
    }
  };

  const commitNewCategory = async () => {
    const name = newCategoryName?.trim();
    setNewCategoryName(null);
    if (name && (await createPixelbotCategory(name, tokens))) {
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
    if (await deletePixelbotCategory(category.id, tokens)) {
      await refresh();
    }
  };

  const handleDeleteDocument = async (doc: PixelbotDocument) => {
    const confirmed = await showSimpleConfirmDialog({
      icon: IconNames.WARNING_SIGN,
      title: 'Delete this document?',
      contents: `"${doc.title}" will be removed from the directory and de-indexed, so Pixel can no longer retrieve it. This can't be undone.`,
      positiveLabel: 'Delete document',
      positiveIntent: Intent.DANGER,
      negativeLabel: 'Cancel',
    });
    if (confirmed && (await deletePixelbotDocument(doc.id, tokens))) {
      setDetailId(prev => (prev === doc.id ? null : prev));
      await refresh();
    }
  };

  const handleOpenMapPreview = async () => {
    setMapPreview('');
    const data = await getPixelbotDocumentMapPreview(tokens);
    setMapPreview(data ? JSON.stringify(data, null, 2) : 'Failed to load document map.');
  };

  const detailDocument = documents.find(d => d.id === detailId);

  return (
    <div>
      <div className={classes.header}>
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
        <span className={classes.rowActions}>
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
            onClick={() => setAddModalOpen(true)}
            disabled={categories.length === 0}
          />
        </span>
      </div>

      {loadError && <Callout intent={Intent.DANGER}>{loadError}</Callout>}

      <div className={classes.list}>
        {categories.map(category => {
          const docs = documentsByCategory.get(category.id) ?? [];
          const isOpen = openCategoryIds.has(category.id);

          return (
            <div key={category.id} className={classes.categoryBlock}>
              <div className={classes.categoryRow} onClick={() => toggleCategoryOpen(category.id)}>
                <Button
                  minimal
                  small
                  icon={isOpen ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_RIGHT}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${category.name}`}
                />
                {renamingCategoryId === category.id ? (
                  <InputGroup
                    small
                    autoFocus
                    className={classes.categoryNameInput}
                    value={renameDraft}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setRenameDraft(e.target.value)}
                    onBlur={commitRenameCategory}
                    onKeyDown={inlineInputKeys(() => setRenamingCategoryId(null))}
                  />
                ) : (
                  <span>{category.name}</span>
                )}
                <span className={classes.docMeta}>
                  {docs.length === 1 ? '1 document' : `${docs.length} documents`}
                </span>
                <span className={classes.rowActions}>
                  <Button
                    minimal
                    small
                    icon={IconNames.EDIT}
                    onClick={e => {
                      e.stopPropagation();
                      setRenamingCategoryId(category.id);
                      setRenameDraft(category.name);
                    }}
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

              {isOpen && (
                <div className={classes.categoryBody}>
                  {docs.length === 0 && (
                    <div className={classNames(classes.docRow, classes.muted)}>
                      No documents yet
                    </div>
                  )}
                  {docs.map(doc => (
                    <div key={doc.id} className={classes.docRow}>
                      <span className={classes.docTitle}>{doc.title}</span>
                      <span className={classes.docMeta}>{formatReleaseDate(doc.releaseDate)}</span>
                      <span className={classes.docMeta}>
                        {pixelbotDocumentStatus(doc.releaseDate)}
                      </span>
                      <span className={classes.rowActions}>
                        <Button
                          minimal
                          small
                          icon={IconNames.EDIT}
                          onClick={() => setDetailId(doc.id)}
                          aria-label="Edit document"
                        />
                        <Button
                          minimal
                          small
                          icon={IconNames.TRASH}
                          intent={Intent.DANGER}
                          onClick={() => handleDeleteDocument(doc)}
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

        {newCategoryName === null ? (
          <Button
            fill
            outlined
            alignText="left"
            className={classes.newCategoryButton}
            icon={IconNames.PLUS}
            text="New category"
            onClick={() => setNewCategoryName('')}
          />
        ) : (
          <InputGroup
            autoFocus
            className={classes.newCategoryInput}
            leftIcon={IconNames.PLUS}
            placeholder="Category name"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onBlur={commitNewCategory}
            onKeyDown={inlineInputKeys(() => setNewCategoryName(null))}
          />
        )}
      </div>

      <AddDocumentsModal
        isOpen={addModalOpen}
        categories={categories}
        tokens={tokens}
        onClose={() => setAddModalOpen(false)}
        onSaved={refresh}
      />

      {detailDocument && (
        <DocumentDetailPopup
          key={detailDocument.id}
          document={detailDocument}
          categories={categories}
          tokens={tokens}
          onClose={() => setDetailId(null)}
          onSaved={refresh}
          onDeleteRequested={() => handleDeleteDocument(detailDocument)}
        />
      )}

      <Dialog
        isOpen={mapPreview !== null}
        onClose={() => setMapPreview(null)}
        title="Document map"
        className={classes.detailDialog}
      >
        <DialogBody>
          <TextArea readOnly fill value={mapPreview ?? ''} style={{ height: 400 }} />
        </DialogBody>
        <DialogFooter actions={<Button text="Close" onClick={() => setMapPreview(null)} />} />
      </Dialog>
    </div>
  );
}

export default PixelbotDocumentsPanel;
