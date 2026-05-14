import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

/**
 * Context to determine which code snippet is active
 */
const CodeSnippetContext = createContext({
  active: '0',
  setActive: (x: string) => {},
});

export function useCodeSnippetContext() {
  const ctx = useContext(CodeSnippetContext);
  if (!ctx) {
    throw new Error('useCodeSnippetContext must be used within a CodeSnippetProvider');
  }
  return ctx;
}

export function CodeSnippetProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState('0');

  const dispatch = useDispatch();
  const handleSnippetEditorOpen = useCallback(
    (s: string) => {
      setActive(s);
      dispatch(WorkspaceActions.resetWorkspace('sicp'));
      dispatch(WorkspaceActions.toggleUsingSubst(false, 'sicp'));
    },
    [dispatch],
  );

  // Close all active code snippet when new page is loaded
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive('0');
  }, []);

  return (
    <CodeSnippetContext.Provider value={{ active, setActive: handleSnippetEditorOpen }}>
      {children}
    </CodeSnippetContext.Provider>
  );
}
