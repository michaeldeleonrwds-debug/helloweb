const INVISIBLE_CODE_PATTERNS = [
    /<!--[\s\S]*?-->/g,
    /<style\b[\s\S]*?<\/style>/gi,
    /<script\b[\s\S]*?<\/script>/gi,
    /<template\b[\s\S]*?<\/template>/gi,
    /<noscript\b[\s\S]*?<\/noscript>/gi,
    /<(?:meta|link|title|base|head|html|body)\b[^>]*>/gi,
];

const SIZED_CODE_ELEMENT = /<(?:img|video|audio|iframe|embed|object|canvas|svg|input|select|textarea|button|hr|table|picture|form)\b/i;

export function hasVisibleCodeContent(html: string): boolean {
    const remaining = INVISIBLE_CODE_PATTERNS.reduce((markup, pattern) => markup.replace(pattern, ''), html);

    if (remaining.replace(/<[^>]+>/g, '').trim() !== '') return true;

    return SIZED_CODE_ELEMENT.test(remaining);
}
