import ReactMarkdown from "react-markdown";

interface ReadmeSectionProps {
  content: string;
}

export default function ReadmeSection({ content }: ReadmeSectionProps) {
  return (
    <div className="mt-6">
      <div className="border border-white/20 rounded-md overflow-hidden">
        {/* README header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              data-view-component="true"
              fill="currentColor"
              className="text-white/70"
            >
              <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"></path>
            </svg>
            <span className="font-semibold text-white">README</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded">
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                fill="currentColor"
              >
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"></path>
              </svg>
            </button>
            <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded">
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                fill="currentColor"
              >
                <path d="M1 2.75A.75.75 0 0 1 1.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 10.25 14h-8.5A1.75 1.75 0 0 1 0 12.25Zm9.22-3.72a.75.75 0 0 1 1.06 0L12 .56l1.72 1.72a.75.75 0 0 1-1.06 1.06L12 2.69 11.34 3.34a.75.75 0 0 1-1.06-1.06Z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* README content */}
        <div className="p-6 bg-[#0d1117]">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-white mb-3 mt-6 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-white mb-3 mt-5">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-bold text-white mb-2 mt-4">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-base font-bold text-white mb-2 mt-4">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-sm font-bold text-white mb-2 mt-4">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="text-white/90 mb-4 leading-relaxed">
                  {children}
                </p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[#58a6ff] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children, className }) => {
                const isInline = !className?.includes("language-");
                return isInline ? (
                  <code className="bg-[#151B23] px-2 py-1 rounded text-white font-mono text-sm">
                    {children}
                  </code>
                ) : (
                  <code className="text-white font-mono text-sm">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-[#151B23] border border-white/20 rounded-md p-4 mb-4 overflow-x-auto">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-white/90 mb-4 space-y-1 ml-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-white/90 mb-4 space-y-1 ml-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-white/90">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-white/30 pl-4 text-white/70 italic mb-4">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-white">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-white/90">{children}</em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}