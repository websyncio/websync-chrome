export function trimStart(text: string, trimValue: string) {
    if (text.startsWith(trimValue)) {
        return text.substring(trimValue.length);
    }
    return text;
}

export function trimEnd(text: string, trimValue: string) {
    if (text.endsWith(trimValue)) {
        return text.slice(0, -trimValue.length);
    }
    return text;
}
