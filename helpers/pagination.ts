export function getPagination(query: any) {
  const page = parseInt(query.page as string) || 1;
  const size = parseInt(query.size as string) || 10;
  const skip = (page - 1) * size;
  return { page, size, skip };
}