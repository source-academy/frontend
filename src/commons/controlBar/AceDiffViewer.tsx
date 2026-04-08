import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-diff/styles.css';
import 'ace-diff/styles-twilight.css';

import * as ace from 'ace-builds';
import AceDiff from 'ace-diff';
import React, { useEffect, useRef } from 'react';

// Disable ace web workers globally (only needs to run once per module load)
(ace.config as any).set('useWorker', false);

type Props = {
  currentCode: string;
  versionCode: string;
};

const AceDiffViewer: React.FC<Props> = ({ currentCode, versionCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<AceDiff | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initDiff = () => {
      if (diffRef.current) return;
      diffRef.current = new AceDiff({
        ace,
        element: container,
        mode: 'ace/mode/javascript',
        theme: 'ace/theme/twilight',
        left: {
          content: currentCode,
          editable: false,
          copyLinkEnabled: false
        },
        right: {
          content: versionCode,
          editable: false,
          copyLinkEnabled: false
        }
      } as any);
    };

    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      // Defer initialization until the container has real dimensions (after Drawer animation)
      if (!diffRef.current) {
        initDiff();
        return;
      }
      const diff = diffRef.current;
      const editors = diff.getEditors();
      editors.left.resize(true);
      editors.right.resize(true);
      const liveLineHeight = editors.left.renderer.lineHeight || editors.right.renderer.lineHeight;
      if (liveLineHeight) {
        (diff as any).lineHeight = liveLineHeight;
      }
      diff.diff();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      diffRef.current?.destroy();
      diffRef.current = null;
    };
    // Only runs on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update content without re-mounting when it changes
  useEffect(() => {
    if (!diffRef.current) return;
    const editors = diffRef.current.getEditors();
    if (editors.left.getValue() !== currentCode) {
      editors.left.setValue(currentCode, -1);
    }
    if (editors.right.getValue() !== versionCode) {
      editors.right.setValue(versionCode, -1);
    }
    diffRef.current.diff();
  }, [currentCode, versionCode]);

  return <div ref={containerRef} className="ace-diff-container" />;
};

export default AceDiffViewer;
