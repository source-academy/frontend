import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatbotCodeSnippet from 'src/pages/sicp/subcomponents/chatbot/ChatbotCodeSnippet';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  message: ChatMessage;
  activeSnippetId: string;
  setActiveSnippetId: (id: string) => void;
};

function RagMessageRenderer({ message, activeSnippetId, setActiveSnippetId }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : 'javascript';
          const code = String(children).replace(/\n$/, '');
          const snippetId = `${message.id}-code-${node?.position?.start.offset ?? 0}`;

          return !inline ? (
            <ChatbotCodeSnippet
              key={snippetId}
              id={snippetId}
              code={code}
              activeSnippetId={activeSnippetId}
              setActiveSnippet={setActiveSnippetId}
              language={lang}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {message.content}
    </ReactMarkdown>
  );
}

export default RagMessageRenderer;
