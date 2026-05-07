export function parseAccessToken(searchParams: URLSearchParams): string {
  const token = searchParams.get("access_token") ?? searchParams.get("token");
  if (token) {
    return token;
  }

  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace("#", "");
    const hashParams = new URLSearchParams(hash);
    return hashParams.get("access_token") ?? "";
  }

  return "";
}
