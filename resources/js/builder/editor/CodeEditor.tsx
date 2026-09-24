import { Check, Code2, Copy, FileCode, Maximize2, Minimize2, Terminal } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

export interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: 'html' | 'css' | 'javascript';
    title?: string;
    placeholder?: string;
    minHeight?: string;
    maxHeight?: string;
    allowFullscreen?: boolean;
    className?: string;
}

interface Token {
    type: 'comment' | 'tag' | 'attr' | 'string' | 'keyword' | 'property' | 'value' | 'number' | 'function' | 'punctuation' | 'text';
    text: string;
}

export function CodeEditor({
    value,
    onChange,
    language = 'html',
    title,
    placeholder,
    minHeight = '180px',
    maxHeight = '500px',
    allowFullscreen = true,
    className = '',
}: CodeEditorProps) {
    const editorId = useId();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);

    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    const lines = useMemo(() => value.split('\n'), [value]);
    const lineCount = Math.max(lines.length, 1);

    // Sync scroll between textarea, pre (highlighted code), and gutter
    const handleScroll = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        if (preRef.current) {
            preRef.current.scrollTop = textarea.scrollTop;
            preRef.current.scrollLeft = textarea.scrollLeft;
        }
        if (gutterRef.current) {
            gutterRef.current.scrollTop = textarea.scrollTop;
        }
    };

    // Update cursor position line & col
    const updateCursorPosition = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const textBefore = value.slice(0, textarea.selectionStart);
        const linesBefore = textBefore.split('\n');
        setCursorPos({
            line: linesBefore.length,
            col: linesBefore[linesBefore.length - 1].length + 1,
        });
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // ignore
        }
    };

    // Handle Tab, Enter, Backspace, and bracket/quote auto-closing
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Escape exits fullscreen
        if (e.key === 'Escape' && isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
            return;
        }

        // Tab and Shift+Tab (2 spaces)
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            if (start === end) {
                const next = value.slice(0, start) + '  ' + value.slice(end);
                onChange(next);
                requestAnimationFrame(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                    updateCursorPosition();
                });
            } else {
                const before = value.slice(0, start);
                const after = value.slice(end);
                const startLineIndex = before.lastIndexOf('\n') + 1;
                const fullSelectedText = value.slice(startLineIndex, end);
                const selectedLines = fullSelectedText.split('\n');

                if (e.shiftKey) {
                    const unindented = selectedLines
                        .map((line) => (line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line))
                        .join('\n');
                    const diff = fullSelectedText.length - unindented.length;
                    onChange(value.slice(0, startLineIndex) + unindented + after);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = Math.max(startLineIndex, start - 2);
                        textarea.selectionEnd = Math.max(startLineIndex, end - diff);
                        updateCursorPosition();
                    });
                } else {
                    const indented = selectedLines.map((line) => '  ' + line).join('\n');
                    const diff = indented.length - fullSelectedText.length;
                    onChange(value.slice(0, startLineIndex) + indented + after);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = start + 2;
                        textarea.selectionEnd = end + diff;
                        updateCursorPosition();
                    });
                }
            }
            return;
        }

        // Auto-close brackets and quotes
        const pairs: Record<string, string> = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
            '`': '`',
            '<': '>',
        };

        if (pairs[e.key]) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start !== end) {
                e.preventDefault();
                const open = e.key;
                const close = pairs[open];
                const selectedText = value.slice(start, end);
                const next = value.slice(0, start) + open + selectedText + close + value.slice(end);
                onChange(next);
                requestAnimationFrame(() => {
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = end + 1;
                    updateCursorPosition();
                });
                return;
            } else {
                // If cursor is right before the matching closing character, just skip over it
                if (['"', "'", '`', ')', ']', '}', '>'].includes(e.key) && value[start] === e.key) {
                    e.preventDefault();
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                    updateCursorPosition();
                    return;
                }
                // Otherwise insert pair
                if (['(', '[', '{', '"', "'", '`'].includes(e.key)) {
                    e.preventDefault();
                    const open = e.key;
                    const close = pairs[open];
                    const next = value.slice(0, start) + open + close + value.slice(start);
                    onChange(next);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                        updateCursorPosition();
                    });
                    return;
                }
            }
        }

        // Enter key: preserve indentation and auto-indent block bodies
        if (e.key === 'Enter') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const textBefore = value.slice(0, start);
            const lastNewLine = textBefore.lastIndexOf('\n');
            const currentLine = textBefore.slice(lastNewLine + 1);
            const indentMatch = currentLine.match(/^(\s*)/);
            let indent = indentMatch ? indentMatch[1] : '';

            const trimmed = currentLine.trimEnd();
            const opensBlock = trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[') || (trimmed.endsWith('>') && !trimmed.endsWith('/>'));
            if (opensBlock) {
                indent += '  ';
            }

            const next = value.slice(0, start) + '\n' + indent + value.slice(start);
            onChange(next);
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
                updateCursorPosition();
            });
            return;
        }

        // Backspace: delete matching pair
        if (e.key === 'Backspace') {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start === end && start > 0) {
                const prev = value[start - 1];
                const nextChar = value[start];
                if (
                    (prev === '{' && nextChar === '}') ||
                    (prev === '(' && nextChar === ')') ||
                    (prev === '[' && nextChar === ']') ||
                    (prev === '"' && nextChar === '"') ||
                    (prev === "'" && nextChar === "'") ||
                    (prev === '`' && nextChar === '`')
                ) {
                    e.preventDefault();
                    const next = value.slice(0, start - 1) + value.slice(start + 1);
                    onChange(next);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = textarea.selectionEnd = start - 1;
                        updateCursorPosition();
                    });
                    return;
                }
            }
        }
    };

    // Highlighted lines memo
    const highlightedLines = useMemo(() => {
        return tokenizeDocument(lines, language);
    }, [lines, language]);

    // Language label and icon
    const langInfo = {
        html: { label: 'HTML', icon: Code2, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
        css: { label: 'CSS', icon: FileCode, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
        javascript: { label: 'JS', icon: Terminal, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    }[language] ?? { label: language.toUpperCase(), icon: Code2, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' };

    const LangIcon = langInfo.icon;

    // Body content
    const editorContent = (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#121316] text-zinc-100 shadow-xl transition-all ${
                isFullscreen ? 'fixed inset-4 z-50 flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] shadow-2xl ring-1 ring-white/10' : className
            }`}
            style={!isFullscreen ? { minHeight, maxHeight } : undefined}
        >
            {/* Window titlebar / toolbar */}
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#16181d] px-3">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${langInfo.color}`}>
                        <LangIcon className="size-3" />
                        {langInfo.label}
                    </span>
                    {title ? <span className="truncate text-xs font-medium text-zinc-300">{title}</span> : null}
                </div>

                <div className="flex items-center gap-1">
                    <span className="mr-2 text-[10px] font-medium text-zinc-500">
                        {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                    </span>

                    <button
                        type="button"
                        className="inline-flex size-6 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                        title={copied ? 'Copied!' : 'Copy code'}
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    </button>

                    {allowFullscreen ? (
                        <button
                            type="button"
                            className="inline-flex size-6 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                            title={isFullscreen ? 'Exit full screen (Esc)' : 'Expand editor'}
                            onClick={() => setIsFullscreen((prev) => !prev)}
                        >
                            {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Code editing workspace */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden font-mono text-xs leading-5">
                {/* Line numbers gutter */}
                <div
                    ref={gutterRef}
                    aria-hidden="true"
                    className="select-none overflow-hidden border-r border-zinc-800/60 bg-[#14151a] py-2.5 pr-2.5 pl-3 text-right font-mono text-[11px] leading-5 text-zinc-600"
                >
                    {Array.from({ length: lineCount }).map((_, idx) => {
                        const lineNum = idx + 1;
                        const isCurrent = lineNum === cursorPos.line;
                        return (
                            <div key={lineNum} className={`tabular-nums ${isCurrent ? 'font-semibold text-zinc-300' : ''}`}>
                                {lineNum}
                            </div>
                        );
                    })}
                </div>

                {/* Editor surface container */}
                <div className="relative min-w-0 flex-1 overflow-auto">
                    {/* Syntax-highlighted representation behind textarea */}
                    <pre
                        ref={preRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-2.5 font-mono text-xs leading-5 text-zinc-200 whitespace-pre"
                        style={{ tabSize: 2 }}
                    >
                        {highlightedLines.map((lineTokens, lineIdx) => {
                            const isCurrent = lineIdx + 1 === cursorPos.line;
                            return (
                                <div
                                    key={lineIdx}
                                    className={`min-h-[20px] rounded-xs px-1 ${isCurrent ? 'bg-white/[0.03]' : ''}`}
                                >
                                    {lineTokens.length === 0 ? (
                                        <span>&nbsp;</span>
                                    ) : (
                                        lineTokens.map((token, tokIdx) => (
                                            <span key={tokIdx} className={tokenClasses(token.type)}>
                                                {token.text}
                                            </span>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </pre>

                    {/* Interactive transparent textarea */}
                    <textarea
                        ref={textareaRef}
                        id={editorId}
                        value={value}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder={placeholder}
                        className="absolute inset-0 m-0 h-full w-full resize-none border-0 bg-transparent p-2.5 font-mono text-xs leading-5 text-transparent caret-sky-400 whitespace-pre outline-none selection:bg-sky-500/30 placeholder:text-zinc-600"
                        style={{ tabSize: 2 }}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        onClick={updateCursorPosition}
                        onKeyUp={updateCursorPosition}
                        onSelect={updateCursorPosition}
                    />
                </div>
            </div>

            {/* Editor status bar */}
            <div className="flex h-6 shrink-0 items-center justify-between border-t border-zinc-800/80 bg-[#14151a] px-3 text-[10px] text-zinc-500">
                <div className="flex items-center gap-3">
                    <span>
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                    <span>Spaces: 2</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>{value.length} chars</span>
                    <span className="uppercase">{language}</span>
                </div>
            </div>
        </div>
    );

    // If in fullscreen, render with a backdrop blur
    if (isFullscreen) {
        return (
            <>
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setIsFullscreen(false)} />
                {editorContent}
            </>
        );
    }

    return editorContent;
}

// Token color mapping
function tokenClasses(type: Token['type']): string {
    switch (type) {
        case 'comment':
            return 'text-zinc-500 italic';
        case 'tag':
            return 'text-rose-400 font-semibold';
        case 'attr':
            return 'text-amber-300';
        case 'string':
            return 'text-emerald-400';
        case 'keyword':
            return 'text-purple-400 font-semibold';
        case 'property':
            return 'text-sky-300';
        case 'value':
            return 'text-teal-300';
        case 'number':
            return 'text-orange-400';
        case 'function':
            return 'text-blue-400';
        case 'punctuation':
            return 'text-zinc-400';
        default:
            return 'text-zinc-200';
    }
}

// Multi-mode tokenizer for HTML, CSS, and JS
function tokenizeDocument(lines: string[], baseLanguage: 'html' | 'css' | 'javascript'): Token[][] {
    let mode: 'html' | 'css' | 'js' = baseLanguage === 'css' ? 'css' : baseLanguage === 'javascript' ? 'js' : 'html';

    return lines.map((line) => {
        if (!line) return [];

        // Check if mode changes inside HTML
        if (baseLanguage === 'html') {
            const trimmed = line.trim();
            if (trimmed.includes('<style')) mode = 'css';
            else if (trimmed.includes('</style>')) mode = 'html';
            else if (trimmed.includes('<script')) mode = 'js';
            else if (trimmed.includes('</script>')) mode = 'html';
        }

        if (mode === 'css') {
            return tokenizeCssLine(line);
        }

        if (mode === 'js') {
            return tokenizeJsLine(line);
        }

        return tokenizeHtmlLine(line);
    });
}

function tokenizeHtmlLine(line: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
        // Comment
        if (line.startsWith('<!--', i)) {
            const end = line.indexOf('-->', i);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 3);
            tokens.push({ type: 'comment', text });
            i += text.length;
            continue;
        }

        // Tag start: </tag or <tag
        if (line[i] === '<') {
            const match = line.slice(i).match(/^<\/?[a-zA-Z0-9-]+/);
            if (match) {
                tokens.push({ type: 'tag', text: match[0] });
                i += match[0].length;
                continue;
            }
            tokens.push({ type: 'punctuation', text: '<' });
            i++;
            continue;
        }

        // Tag end: > or />
        if (line.startsWith('/>', i)) {
            tokens.push({ type: 'tag', text: '/>' });
            i += 2;
            continue;
        }
        if (line[i] === '>') {
            tokens.push({ type: 'tag', text: '>' });
            i++;
            continue;
        }

        // Strings inside tag
        if (line[i] === '"' || line[i] === "'") {
            const quote = line[i];
            const end = line.indexOf(quote, i + 1);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 1);
            tokens.push({ type: 'string', text });
            i += text.length;
            continue;
        }

        // Attribute name: word followed by =
        const attrMatch = line.slice(i).match(/^([a-zA-Z0-9_:-]+)(?=\s*=)/);
        if (attrMatch) {
            tokens.push({ type: 'attr', text: attrMatch[0] });
            i += attrMatch[0].length;
            continue;
        }

        // Equal sign
        if (line[i] === '=') {
            tokens.push({ type: 'punctuation', text: '=' });
            i++;
            continue;
        }

        // General word / text
        const textMatch = line.slice(i).match(/^[^<>"'=]+/);
        if (textMatch) {
            tokens.push({ type: 'text', text: textMatch[0] });
            i += textMatch[0].length;
            continue;
        }

        tokens.push({ type: 'text', text: line[i] });
        i++;
    }

    return tokens;
}

function tokenizeCssLine(line: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
        // Comment
        if (line.startsWith('/*', i)) {
            const end = line.indexOf('*/', i);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 2);
            tokens.push({ type: 'comment', text });
            i += text.length;
            continue;
        }

        // String
        if (line[i] === '"' || line[i] === "'") {
            const quote = line[i];
            const end = line.indexOf(quote, i + 1);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 1);
            tokens.push({ type: 'string', text });
            i += text.length;
            continue;
        }

        // Numbers and units: 16px, 1.5rem, 50%, #fff, #123456
        const numMatch = line.slice(i).match(/^#[0-9a-fA-F]{3,8}\b|^-?\d+(?:\.\d+)?(px|rem|em|%|vh|vw|ms|s|deg|fr)?\b/);
        if (numMatch) {
            tokens.push({ type: 'number', text: numMatch[0] });
            i += numMatch[0].length;
            continue;
        }

        // !important
        if (line.startsWith('!important', i)) {
            tokens.push({ type: 'keyword', text: '!important' });
            i += '!important'.length;
            continue;
        }

        // CSS property: word followed by colon
        const propMatch = line.slice(i).match(/^([a-zA-Z-]+)(?=\s*:)/);
        if (propMatch) {
            tokens.push({ type: 'property', text: propMatch[0] });
            i += propMatch[0].length;
            continue;
        }

        // Selectors & at-rules
        const selectorMatch = line.slice(i).match(/^(&|::?[a-zA-Z-]+|@[a-zA-Z-]+|[.#][a-zA-Z0-9_-]+)/);
        if (selectorMatch) {
            tokens.push({ type: 'keyword', text: selectorMatch[0] });
            i += selectorMatch[0].length;
            continue;
        }

        // Function calls: rgba(), var(), calc()
        const funcMatch = line.slice(i).match(/^(rgba?|hsla?|calc|var|url|clamp|min|max)(?=\()/);
        if (funcMatch) {
            tokens.push({ type: 'function', text: funcMatch[0] });
            i += funcMatch[0].length;
            continue;
        }

        // Punctuation
        if ('{}:;(),[]'.includes(line[i])) {
            tokens.push({ type: 'punctuation', text: line[i] });
            i++;
            continue;
        }

        // Text
        const textMatch = line.slice(i).match(/^[^/*"'#\d!a-zA-Z@.:&{}:;(),[\]]+/);
        if (textMatch) {
            tokens.push({ type: 'text', text: textMatch[0] });
            i += textMatch[0].length;
            continue;
        }

        // Word
        const wordMatch = line.slice(i).match(/^[a-zA-Z0-9_-]+/);
        if (wordMatch) {
            tokens.push({ type: 'value', text: wordMatch[0] });
            i += wordMatch[0].length;
            continue;
        }

        tokens.push({ type: 'text', text: line[i] });
        i++;
    }

    return tokens;
}

function tokenizeJsLine(line: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    const keywords = new Set([
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally',
        'throw', 'new', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of', 'class',
        'extends', 'super', 'this', 'import', 'export', 'from', 'as', 'async', 'await', 'yield',
    ]);

    const literals = new Set(['true', 'false', 'null', 'undefined', 'NaN']);

    while (i < line.length) {
        // Single-line comment
        if (line.startsWith('//', i)) {
            tokens.push({ type: 'comment', text: line.slice(i) });
            break;
        }

        // Multi-line comment
        if (line.startsWith('/*', i)) {
            const end = line.indexOf('*/', i);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 2);
            tokens.push({ type: 'comment', text });
            i += text.length;
            continue;
        }

        // Strings
        if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
            const quote = line[i];
            const end = line.indexOf(quote, i + 1);
            const text = end === -1 ? line.slice(i) : line.slice(i, end + 1);
            tokens.push({ type: 'string', text });
            i += text.length;
            continue;
        }

        // Numbers
        const numMatch = line.slice(i).match(/^\b\d+(?:\.\d+)?\b/);
        if (numMatch) {
            tokens.push({ type: 'number', text: numMatch[0] });
            i += numMatch[0].length;
            continue;
        }

        // Identifier / keyword / function
        const identMatch = line.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
        if (identMatch) {
            const word = identMatch[0];
            if (keywords.has(word)) {
                tokens.push({ type: 'keyword', text: word });
            } else if (literals.has(word)) {
                tokens.push({ type: 'number', text: word });
            } else if (line.slice(i + word.length).trimStart().startsWith('(')) {
                tokens.push({ type: 'function', text: word });
            } else {
                tokens.push({ type: 'text', text: word });
            }
            i += word.length;
            continue;
        }

        // Punctuation / operators
        if ('{}()[];:,.<>=!+-*/&|^?~%'.includes(line[i])) {
            tokens.push({ type: 'punctuation', text: line[i] });
            i++;
            continue;
        }

        tokens.push({ type: 'text', text: line[i] });
        i++;
    }

    return tokens;
}
