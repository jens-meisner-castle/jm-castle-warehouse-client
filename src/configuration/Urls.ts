export const backendApiUrl =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:53001/api`
    : `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

export const getImageDisplayUrl = (
  apiUrl: string,
  imageId: string | undefined
) =>
  imageId ? `${apiUrl}/image-content/image?image_id=${imageId}` : undefined;
