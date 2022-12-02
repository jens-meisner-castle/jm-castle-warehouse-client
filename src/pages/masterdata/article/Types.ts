import { ArticleRow } from "../../../types/RowTypes";
import { ImageFile } from "../../../utils/Types";

export interface ArticleEditState {
  row: ArticleRow;
  newImage?: ImageFile | null;
  deleteImageReference?: boolean;
}
