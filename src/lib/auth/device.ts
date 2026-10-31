/** "Chrome on macOS" from a user-agent string; good enough to recognise your own devices. */
export function describeDevice(userAgent: string | null | undefined) {
    if (!userAgent) return "Unknown device";
    // Order matters: Edge and Chrome UAs both contain "Chrome", and every Chromium UA contains "Safari"
    const browser = [["Edg/", "Edge"], ["Firefox/", "Firefox"], ["Chrome/", "Chrome"], ["Safari/", "Safari"], ["curl/", "curl"]]
        .find(([token]) => userAgent.includes(token))?.[1] ?? "Browser";
    const os = [["iPhone", "iOS"], ["iPad", "iPadOS"], ["Android", "Android"], ["Mac OS X", "macOS"], ["Windows", "Windows"], ["Linux", "Linux"]]
        .find(([token]) => userAgent.includes(token))?.[1];
    return os ? `${browser} on ${os}` : browser;
}
