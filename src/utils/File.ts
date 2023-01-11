export const getExtension = (path: string): string => {
  const parts = path.split(".");
  const extension = parts[parts.length - 1];
  return extension;
};

export const getFilename = (path: string): string => {
  let separator = "/";
  if (path.includes("\\")) {
    separator = "\\";
  }
  const parts = path.split(separator);
  const name = parts[parts.length - 1];
  return name;
};
