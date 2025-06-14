import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { postprocessChineseTilde } from '@/utils/chineseTildeProcessor';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 递归处理 children，替换其中的临时标记
const processChildren = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === 'string') {
    return postprocessChineseTilde(children);
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <span key={index}>{processChildren(child)}</span>
    ));
  }

  return children;
};

export const MarkdownRenderer = ({
  content,
  className = '',
}: MarkdownRendererProps) => {
  return (
    <div className={`prose prose-sm max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 自定义标题样式
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-700 mb-3 mt-4 first:mt-0 border-b border-gray-200 pb-2">
              {processChildren(children)}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-700 mb-2 mt-3 first:mt-0">
              {processChildren(children)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 mb-2 mt-3 first:mt-0">
              {processChildren(children)}
            </h3>
          ),

          // 段落样式
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed text-gray-600">
              {processChildren(children)}
            </p>
          ),

          // 列表样式
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 ml-4 text-gray-600">
              {processChildren(children)}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 ml-4 text-gray-600">
              {processChildren(children)}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{processChildren(children)}</li>
          ),

          // 代码样式
          code: ({ children, className }) => {
            const isInlineCode = !className;
            const processedChildren = processChildren(children);

            if (isInlineCode) {
              return (
                <code className="bg-blue-50/70 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono">
                  {processedChildren}
                </code>
              );
            }
            return (
              <code className="block bg-blue-50/70 text-gray-700 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre border border-blue-100">
                {processedChildren}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 mb-3 overflow-x-auto">
              {processChildren(children)}
            </pre>
          ),

          // 引用样式
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 bg-blue-50/30 pl-4 py-2 mb-3 italic text-gray-600">
              {processChildren(children)}
            </blockquote>
          ),

          // 链接样式
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {processChildren(children)}
            </a>
          ),

          // 表格样式
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {processChildren(children)}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{processChildren(children)}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
              {processChildren(children)}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-3 py-2 text-gray-600">
              {processChildren(children)}
            </td>
          ),

          // 分割线样式
          hr: () => <hr className="border-gray-200 my-4" />,

          // 强调文本样式
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-700">
              {processChildren(children)}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-600">
              {processChildren(children)}
            </em>
          ),

          // 删除线样式
          del: ({ children }) => (
            <del className="line-through opacity-70">
              {processChildren(children)}
            </del>
          ),

          // 图片样式
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={postprocessChineseTilde(alt || '')}
              className="max-w-full h-auto rounded-lg my-3"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
