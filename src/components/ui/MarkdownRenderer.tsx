import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, FileCode } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onExtractArtifact?: (title: string, language: string, content: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className, onExtractArtifact }) => {
  return (
    <div className={className}>
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className: codeClassName, children, ...props }) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const codeString = String(children).replace(/\n$/, '');
          const isInline = !match;
          const [copied, setCopied] = useState(false);

          const handleCopy = (e: React.MouseEvent) => {
            e.stopPropagation();
            navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          };

          const handleExtract = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (onExtractArtifact && match) {
              const lang = match[1];
              const extMap: Record<string, string> = {
                javascript: 'js',
                typescript: 'ts',
                python: 'py',
                html: 'html',
                css: 'css',
                json: 'json',
                sql: 'sql',
                markdown: 'md',
                rust: 'rs',
                go: 'go',
                c: 'c',
                cpp: 'cpp',
              };
              const ext = extMap[lang.toLowerCase()] || lang;
              const title = `artifact_${lang}.${ext}`;
              onExtractArtifact(title, lang, codeString);
            }
          };

          return !isInline ? (
            <div className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-block-lang">{match[1]}</span>
                <div className="code-block-actions">
                  {onExtractArtifact && (
                    <button
                      className="code-block-extract-btn"
                      onClick={handleExtract}
                      title="Extract to Canvas as Artifact Node"
                    >
                      <FileCode size={12} />
                      <span>Artifact</span>
                    </button>
                  )}
                  <button
                    className="code-block-copy-btn"
                    onClick={handleCopy}
                    title="Copy code"
                  >
                    {copied ? <Check size={12} color="#30D158" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
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
