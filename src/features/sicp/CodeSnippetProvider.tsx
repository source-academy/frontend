import { createContext, useCallback, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

type CodeSnippetContextState = {
  active: string;
  setActive: (x: string) => void;
};

/**
 * Context to determine which code snippet is active
 */
const CodeSnippetContext = createContext<CodeSnippetContextState | null>(null);

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

  return (
    <CodeSnippetContext.Provider value={{ active, setActive: handleSnippetEditorOpen }}>
      {children}
    </CodeSnippetContext.Provider>
  );
}
