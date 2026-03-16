const rawBaseUrl =
  typeof import.meta.env.VITE_BACKEND_URL === "string"
    ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, "")
    : "";

export const getAssetUrl = (path) => {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return rawBaseUrl ? `${rawBaseUrl}${normalizedPath}` : normalizedPath;
};
