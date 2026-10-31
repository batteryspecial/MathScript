/** Keeps `?next=` to same-origin paths so it can't become an open redirect. */
export function safeNext(raw: string | string[] | undefined, fallback = "/projects") {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
    return value;
}
