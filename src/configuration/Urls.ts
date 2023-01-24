export const backendApiUrl =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:53001/api`
    : `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

export const enterUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/landing-page`;

export const getImageDisplayUrl = (
  apiUrl: string,
  imageId: string | undefined,
  dataset_version?: number
) =>
  imageId
    ? dataset_version
      ? `${apiUrl}/image-content/image?image_id=${imageId}&dataset_version=${dataset_version}`
      : `${apiUrl}/image-content/image?image_id=${imageId}`
    : undefined;
