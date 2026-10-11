export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";
export function apiUrl(path: string) { return `${API_ORIGIN}${path}`; }