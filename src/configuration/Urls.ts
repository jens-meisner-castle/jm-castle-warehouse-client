export const backendApiUrl =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:53002/api`
    : `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

export const backendPubSubApiUrl =
  process.env.NODE_ENV === "development"
    ? `wss://${window.location.hostname}:53002/api`
    : `wss://${window.location.hostname}:${window.location.port}/api`;
export const enterUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/landing-page`;

export const getCompleteUrlForPath = (path: string) =>
  `${window.location.protocol}//${window.location.hostname}:${window.location.port}${path}`;

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

export const badCharsInSearchValue = ["+", "&"];
