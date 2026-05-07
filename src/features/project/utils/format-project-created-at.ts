export function formatProjectCreatedAt(createdAt: string | null): string {
  if (!createdAt) {
    return "-";
  }

  return new Date(createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
