export const getExtension = (path: string): string => {
  const parts = path.split(".");
  const extension = parts[parts.length - 1];
  return extension;
};
