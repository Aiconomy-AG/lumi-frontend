import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MessageMarkdownProps {
    content: string
    className?: string
}

function markdownComponents(): Components {
    return {
        p: ({ children }) => (
            <p className="mb-2 leading-relaxed last:mb-0 [&:not(:first-child)]:mt-0">{children}</p>
        ),
        strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
        em: ({ children }) => <em className="text-zinc-200 italic">{children}</em>,
        ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1.5 pl-4 last:mb-0 marker:text-cyan-400/70">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1.5 pl-4 last:mb-0 marker:text-cyan-400/70">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed [&>p]:mb-0">{children}</li>,
        code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-')

            if (isBlock) {
                return (
                    <code className={cn('block font-mono text-[0.85em]', className)} {...props}>
                        {children}
                    </code>
                )
            }

            return (
                <code
                    className="rounded bg-cyan-950/50 px-1 py-0.5 font-mono text-[0.85em] text-cyan-200"
                    {...props}
                >
                    {children}
                </code>
            )
        },
        pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg border border-zinc-700/50 bg-zinc-950/70 p-2.5 text-xs last:mb-0">
                {children}
            </pre>
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
            >
                {children}
            </a>
        ),
        h1: ({ children }) => (
            <h3 className="mt-3 mb-1.5 text-base font-semibold text-zinc-50 first:mt-0">{children}</h3>
        ),
        h2: ({ children }) => (
            <h4 className="mt-3 mb-1.5 text-sm font-semibold text-zinc-50 first:mt-0">{children}</h4>
        ),
        h3: ({ children }) => (
            <h5 className="mt-2 mb-1 text-sm font-semibold text-zinc-100 first:mt-0">{children}</h5>
        ),
        blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-cyan-500/40 pl-3 text-zinc-300 last:mb-0">
                {children}
            </blockquote>
        ),
        hr: () => <hr className="my-3 border-zinc-700/80" />,
        table: ({ children }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
                <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
        ),
        th: ({ children }) => (
            <th className="border border-zinc-700/80 bg-zinc-900/60 px-2 py-1 font-semibold">{children}</th>
        ),
        td: ({ children }) => <td className="border border-zinc-700/80 px-2 py-1">{children}</td>,
    }
}

export function MessageMarkdown({ content, className }: MessageMarkdownProps) {
    return (
        <div className={cn('break-words', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents()}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
