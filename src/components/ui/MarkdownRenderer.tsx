import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className}>
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className: codeClassName, children, ...props }) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const codeString = String(children).replace(/\n$/, '');
          const isInline = !match;
          return !isInline ? (
            <div className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-block-lang">{match[1]}</span>
                <button
                  className="code-block-copy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(codeString);
                  }}
                >
                  Copy
                </button>
              </div>
              <pre className={codeClassName}>
                <code className={codeClassName}>{children}</code>
              </pre>
            </div>
          ) : (
            <code className={codeClassName} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};
