export function generateAppSlug(name: string): string {
  if (!name || !name.trim()) return 'app';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except hyphen/space
    .replace(/[\s_-]+/g, '-') // convert spaces & underscores to hyphens
    .replace(/^-+|-+$/g, '') || 'app'; // trim leading/trailing hyphens
}
