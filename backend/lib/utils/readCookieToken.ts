export default function readCookieToken(cookie: string | undefined) {
    if (!cookie) return ''
    const cookieToken = cookie.split("; ").find((row) => row.startsWith("token="))
    if (!cookieToken) return ''
    return cookieToken.slice(6);
}