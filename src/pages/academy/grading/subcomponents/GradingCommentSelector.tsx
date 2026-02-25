import { Button, Checkbox, H5, NonIdealState, Spinner, TextArea } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import styles from 'src/styles/GradingCommentSelector.module.scss';

type DiffOp = { op: 'eq' | 'add' | 'del'; text: string };

type Props = {
  comments: string[];
  isLoading: boolean;
  selectedIndices: number[];
  edits: Record<number, string>;
  onToggle: (index: number) => void;
  onEditChange: (index: number, text: string) => void;
};

/**
 * Computes a word-level Myers diff between two strings.
 * Uses a simple O(ND) implementation suitable for short comment texts.
 */
function computeWordDiff(original: string, edited: string): DiffOp[] {
  const tokenize = (s: string): string[] => s.match(/\S+|\s+/g) || [];
  const a = tokenize(original);
  const b = tokenize(edited);
  const ops = myersDiff(a, b);
  return ops;
}

function myersDiff(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v: Record<number, number> = { 1: 0 };
  const trace: Array<Record<number, number>> = [];

  outer: for (let d = 0; d <= max; d++) {
    const vSnap: Record<number, number> = { ...v };
    trace.push(vSnap);
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v[k - 1] ?? 0) < (v[k + 1] ?? 0))) {
        x = v[k + 1] ?? 0;
      } else {
        x = (v[k - 1] ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[k] = x;
      if (x >= n && y >= m) {
        break outer;
      }
    }
  }

  // Backtrack to build the edit script
  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d > 0; d--) {
    const vPrev = trace[d];
    const k = x - y;
    let prevK: number;
    if (k === -d || (k !== d && (vPrev[k - 1] ?? 0) < (vPrev[k + 1] ?? 0))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = vPrev[prevK] ?? 0;
    const prevY = prevX - prevK;
    // Diagonal (equal)
    while (x > prevX && y > prevY) {
      x--;
      y--;
      ops.push({ op: 'eq', text: a[x] });
    }
    if (x === prevX && y > prevY) {
      y--;
      ops.push({ op: 'add', text: b[y] });
    } else if (y === prevY && x > prevX) {
      x--;
      ops.push({ op: 'del', text: a[x] });
    }
  }
  // Any remaining diagonal at d=0
  while (x > 0 && y > 0) {
    x--;
    y--;
    ops.push({ op: 'eq', text: a[x] });
  }

  return ops.reverse();
}

const InlineDiff: React.FC<{ original: string; edited: string }> = ({ original, edited }) => {
  const ops = computeWordDiff(original, edited);
  return (
    <div className={styles['diff-preview']}>
      {ops.map((op, i) => {
        switch (op.op) {
          case 'eq':
            return <span key={i}>{op.text}</span>;
          case 'del':
            return (
              <span key={i} className={styles['diff-del']}>
                {op.text}
              </span>
            );
          case 'add':
            return (
              <span key={i} className={styles['diff-add']}>
                {op.text}
              </span>
            );
        }
      })}
    </div>
  );
};

const GradingCommentSelector: React.FC<Props> = props => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleToggleEdit = useCallback(
    (index: number) => {
      if (editingIndex === index) {
        setEditingIndex(null);
      } else {
        // Initialise edit text with original if not already edited
        if (props.edits[index] === undefined) {
          props.onEditChange(index, props.comments[index]);
        }
        setEditingIndex(index);
      }
    },
    [editingIndex, props]
  );

  return (
    <div className={styles['grading-comment-selector']}>
      <H5 className={styles['grading-comment-selector-title']}>LLM Comment Suggestions:</H5>

      {props.isLoading ? (
        <NonIdealState icon={<Spinner />} />
      ) : (
        <div>
          {props.comments.length > 0 ? (
            props.comments.map((comment, index) => {
              const isSelected = props.selectedIndices.includes(index);
              const isEditing = editingIndex === index;
              const editedText = props.edits[index];
              const hasEdits = editedText !== undefined && editedText !== comment;

              return (
                <div
                  key={index}
                  className={`${styles['grading-comment-selector-item']} ${isSelected ? styles['selected'] : ''}`}
                >
                  <div className={styles['comment-header']}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => props.onToggle(index)}
                      className={styles['comment-checkbox']}
                    />
                    <div className={styles['comment-text']} onClick={() => props.onToggle(index)}>
                      {comment}
                    </div>
                    {isSelected && (
                      <Button
                        small
                        minimal
                        icon={isEditing ? IconNames.CHEVRON_UP : IconNames.EDIT}
                        onClick={() => handleToggleEdit(index)}
                        className={styles['edit-button']}
                      />
                    )}
                  </div>

                  {isEditing && (
                    <div className={styles['edit-section']}>
                      <TextArea
                        fill
                        value={editedText ?? comment}
                        onChange={e => props.onEditChange(index, e.target.value)}
                        className={styles['edit-textarea']}
                      />
                      {hasEdits && (
                        <>
                          <H5 className={styles['diff-title']}>Changes:</H5>
                          <InlineDiff original={comment} edited={editedText} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <span>No Comments Generated</span>
          )}
        </div>
      )}
    </div>
  );
};

export default GradingCommentSelector;
