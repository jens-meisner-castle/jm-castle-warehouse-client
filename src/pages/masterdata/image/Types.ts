import { ImageContentRow } from "../../../types/RowTypes";
import { ImageFile } from "../../../utils/Types";

export interface ImageContentEditState {
  row: ImageContentRow;
  newImage?: ImageFile | null;
}
