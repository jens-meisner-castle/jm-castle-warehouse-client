import {
  InsertResponse,
  Row_Article,
  Row_ImageContent,
  Row_ImageReference,
  UpdateResponse,
} from "jm-castle-warehouse-types/build";
import { useEffect, useMemo, useReducer } from "react";
import { initialMasterdataFields } from "../utils/DbValues";
import { useArticleUpdate } from "./useArticleUpdate";
import { useImageContentInsert } from "./useImageContentInsert";
import { useImageReferenceInsert } from "./useImageReferenceInsert";

export type ExecutionStatus = {
  result: {
    article?: UpdateResponse<Row_Article>;
    imageRef?: InsertResponse<Row_ImageReference>;
    imageContent?: InsertResponse<Row_ImageContent>;
  };
  completed: boolean;
  error?: string;
  action: ExecutionAction["type"] | "none";
};

type ExecutionAction =
  | { type: "update-article"; error?: never; payload?: never }
  | { type: "insert-image"; error?: never; payload?: never }
  | { type: "insert-image-ref"; error?: never; payload?: never }
  | { type: "insert-image-content"; error?: never; payload?: never }
  | { type: "reset"; error?: never; payload?: never }
  | { type: "completed"; error?: never; payload?: never }
  | { type: "error"; error: string; payload?: never }
  | {
      type: "article-success";
      payload: UpdateResponse<Row_Article>;
      error?: never;
    }
  | {
      type: "image-ref-success";
      payload: UpdateResponse<Row_ImageReference>;
      error?: never;
    }
  | {
      type: "image-content-success";
      payload: UpdateResponse<Row_ImageContent>;
      error?: never;
    };

const reducer = (
  previous: ExecutionStatus,
  action: ExecutionAction
): ExecutionStatus => {
  console.log("action", action);
  const { type, error, payload } = action;
  switch (type) {
    case "completed":
      return { ...previous, completed: true, action: "none" };
    case "reset":
      return previous.error ||
        Object.keys(previous.result).length ||
        previous.action !== "none"
        ? { result: {}, action: "none", completed: false }
        : previous;
    case "update-article":
      return previous.action === "none"
        ? { action: "update-article", result: {}, completed: false }
        : previous;
    case "article-success":
      return previous.action === "update-article"
        ? {
            action: "insert-image",
            result: { article: payload },
            completed: previous.completed,
          }
        : previous;
    case "insert-image-ref":
      return previous.action === "insert-image"
        ? {
            action: "insert-image-ref",
            result: { ...previous.result },
            completed: false,
          }
        : previous;
    case "image-ref-success":
      return previous.action === "insert-image-ref"
        ? {
            action: "insert-image-content",
            result: { ...previous.result, imageRef: payload },
            completed: previous.completed,
          }
        : previous;
    case "insert-image-content":
      return previous.action === "insert-image-ref"
        ? {
            action: "insert-image-content",
            result: { ...previous.result },
            completed: false,
          }
        : previous;
    case "image-content-success":
      return previous.action === "insert-image-content"
        ? {
            action: "none",
            result: { ...previous.result, imageContent: payload },
            completed: true,
          }
        : previous;
    case "error": {
      switch (previous.action) {
        case "update-article":
          return {
            error,
            action: "none",
            result: { article: { error } },
            completed: true,
          };
        case "insert-image-ref":
          return {
            error,
            action: "none",
            result: { ...previous.result, imageRef: { error } },
            completed: true,
          };
        case "insert-image-content":
          return {
            error,
            action: "none",
            result: { ...previous.result, imageContent: { error } },
            completed: true,
          };
        default:
          return previous;
      }
    }
    default:
      return previous;
  }
};
/**
 *
 * @param apiUrl backend api
 * @param article article to update
 * @param imageContent the used article image content
 * @param updateIndicator change to re-execute (0 => no execute)
 * @returns
 */
export const useArticleUpdateWithImage = (
  apiUrl: string,
  article: Row_Article | undefined,
  imageContent:
    | {
        row: Omit<
          Omit<Omit<Row_ImageContent, "size_in_bytes">, "width">,
          "height"
        >;
        file: File;
      }
    | undefined,
  updateIndicator: number
) => {
  const imageRef: Row_ImageReference | undefined = useMemo(() => {
    if (imageContent) {
      const newRef: Row_ImageReference = {
        image_id: imageContent.row.image_id,
        reference: "article",
        ...initialMasterdataFields(),
      };
      return newRef;
    }
    return undefined;
  }, [imageContent]);
  const [status, dispatch] = useReducer<typeof reducer, ExecutionStatus>(
    reducer,
    { result: {}, action: "none", completed: false },
    (previous) => previous
  );

  useEffect(() => {
    if (!updateIndicator) {
      dispatch({ type: "reset" });
    }
  }, [updateIndicator]);

  useEffect(() => {
    if (updateIndicator) {
      if (article) {
        dispatch({ type: "update-article" });
      }
    }
  }, [updateIndicator, article]);

  const { result: articleResult, error: articleError } = useArticleUpdate(
    apiUrl,
    article,
    status.action === "update-article" ? updateIndicator : 0
  );

  useEffect(() => {
    if (updateIndicator) {
      if (articleError) {
        dispatch({ type: "error", error: articleError });
        return;
      }
      if (articleResult) {
        dispatch({
          type: "article-success",
          payload: { result: articleResult },
        });
      }
    }
  }, [updateIndicator, articleResult, articleError]);

  const currentAction = status.action;

  useEffect(() => {
    if (updateIndicator && currentAction === "insert-image") {
      if (imageContent) {
        dispatch({ type: "insert-image-ref" });
      } else {
        dispatch({ type: "completed" });
      }
    }
  }, [updateIndicator, currentAction, imageContent]);

  const { result: imageRefResult, error: imageRefError } =
    useImageReferenceInsert(
      apiUrl,
      imageRef,
      status.action === "insert-image-ref" ? updateIndicator : 0
    );

  useEffect(() => {
    if (updateIndicator) {
      if (imageRefError) {
        dispatch({ type: "error", error: imageRefError });
        return;
      }
      if (imageRefResult) {
        dispatch({
          type: "image-ref-success",
          payload: { result: imageRefResult },
        });
      }
    }
  }, [updateIndicator, imageRefError, imageRefResult]);

  const { result: imageContentResult, error: imageContentError } =
    useImageContentInsert(
      apiUrl,
      imageContent ? imageContent.row.image_id : undefined,
      imageContent ? imageContent.row.image_extension : undefined,
      imageContent ? imageContent.file : undefined,
      status.action === "insert-image-content" ? updateIndicator : 0
    );

  useEffect(() => {
    if (updateIndicator) {
      if (imageContentError) {
        dispatch({ type: "error", error: imageContentError });
        return;
      }
      if (imageContentResult) {
        dispatch({
          type: "image-content-success",
          payload: { result: imageContentResult },
        });
      }
    }
  }, [updateIndicator, imageContentError, imageContentResult]);

  return status;
};
