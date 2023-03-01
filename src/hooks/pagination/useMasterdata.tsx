import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { ErrorData } from "../../components/ErrorDisplays";
import {
  ArticleRow,
  AttributeRow,
  CostunitRow,
  fromRawArticle,
  fromRawAttribute,
  fromRawCostunit,
  fromRawHashtag,
  fromRawImageContent,
  fromRawManufacturer,
  fromRawReceiver,
  fromRawStore,
  fromRawStoreSection,
  HashtagRow,
  ImageContentRow,
  ManufacturerRow,
  ReceiverRow,
  StoreRow,
  StoreSectionRow,
} from "../../types/RowTypes";
import { useArticleSelect } from "./useArticleSelect";
import { useAttributeSelect } from "./useAttributeSelect";
import { useCostunitSelect } from "./useCostunitSelect";
import { useHashtagSelect } from "./useHashtagSelect";
import { useImageContentSelect } from "./useImageContentSelect";
import { useManufacturerSelect } from "./useManufacturerSelect";
import { useReceiverSelect } from "./useReceiverSelect";
import { useStoreSectionSelect } from "./useStoreSectionSelect";
import { useStoreSelect } from "./useStoreSelect";

export interface Masterdata {
  errors: Record<string, ErrorData>;
  rows: {
    articleRows?: ArticleRow[];
    hashtagRows?: HashtagRow[];
    manufacturerRows?: ManufacturerRow[];
    attributeRows?: AttributeRow[];
    storeRows?: StoreRow[];
    sectionRows?: StoreSectionRow[];
    costunitRows?: CostunitRow[];
    receiverRows?: ReceiverRow[];
    imageContentRows?: ImageContentRow[];
  };
}
export const useMasterdata = (
  apiUrl: string,
  what: {
    article?: boolean;
    hashtag?: boolean;
    manufacturer?: boolean;
    attribute?: boolean;
    store?: boolean;
    section?: boolean;
    costunit?: boolean;
    receiver?: boolean;
    imageContent?: boolean;
  },
  updateIndicator: number,
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void
) => {
  const [masterdata, setMasterdata] = useState<Masterdata>({
    errors: {},
    rows: {},
  });

  const {
    article,
    hashtag,
    manufacturer,
    attribute,
    costunit,
    imageContent,
    receiver,
    store,
    section,
  } = what;

  const articleApiResponse = useArticleSelect(
    apiUrl,
    article ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { pages: articlePages } = articleResponse || {};

  const storeSectionApiResponse = useStoreSectionSelect(
    apiUrl,
    section ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: storeSectionResponse } = storeSectionApiResponse;
  const { pages: storeSectionPages } = storeSectionResponse || {};

  const storeApiResponse = useStoreSelect(
    apiUrl,
    store ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { pages: storePages } = storeResponse || {};

  const receiverApiResponse = useReceiverSelect(
    apiUrl,
    receiver ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { pages: receiverPages } = receiverResponse || {};

  const imageContentApiResponse = useImageContentSelect(
    apiUrl,
    imageContent ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: imageContentResponse } = imageContentApiResponse;
  const { pages: imageContentPages } = imageContentResponse || {};

  const costunitApiResponse = useCostunitSelect(
    apiUrl,
    costunit ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: costunitResponse } = costunitApiResponse;
  const { pages: costunitPages } = costunitResponse || {};

  const attributeApiResponse = useAttributeSelect(
    apiUrl,
    attribute ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: attributeResponse } = attributeApiResponse;
  const { pages: attributePages } = attributeResponse || {};

  const manufacturerApiResponse = useManufacturerSelect(
    apiUrl,
    manufacturer ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: manufacturerResponse } = manufacturerApiResponse;
  const { pages: manufacturerPages } = manufacturerResponse || {};

  const hashtagApiResponse = useHashtagSelect(
    apiUrl,
    hashtag ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { pages: hashtagPages } = hashtagResponse || {};

  useEffect(() => {
    const newRows: ArticleRow[] = [];
    articlePages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawArticle(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, articleRows: newRows },
    }));
  }, [articlePages]);

  useEffect(() => {
    const newRows: StoreSectionRow[] = [];
    storeSectionPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawStoreSection(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, storeSectionRows: newRows },
    }));
  }, [storeSectionPages]);

  useEffect(() => {
    const newRows: StoreRow[] = [];
    storePages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawStore(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, storeRows: newRows },
    }));
  }, [storePages]);

  useEffect(() => {
    const newRows: ReceiverRow[] = [];
    receiverPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawReceiver(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, receiverRows: newRows },
    }));
  }, [receiverPages]);

  useEffect(() => {
    const newRows: ImageContentRow[] = [];
    imageContentPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawImageContent(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, imageContentRows: newRows },
    }));
  }, [imageContentPages]);

  useEffect(() => {
    const newRows: CostunitRow[] = [];
    costunitPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawCostunit(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, costunitRows: newRows },
    }));
  }, [costunitPages]);

  useEffect(() => {
    const newRows: AttributeRow[] = [];
    attributePages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawAttribute(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, attributeRows: newRows },
    }));
  }, [attributePages]);

  useEffect(() => {
    const newRows: ManufacturerRow[] = [];
    manufacturerPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawManufacturer(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, manufacturerRows: newRows },
    }));
  }, [manufacturerPages]);

  useEffect(() => {
    const newRows: HashtagRow[] = [];
    hashtagPages?.forEach((page) => {
      const { result } = page;
      const { rows } = result || {};
      rows?.forEach((r) => newRows.push(fromRawHashtag(r)));
    });

    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, hashtagRows: newRows },
    }));
  }, [hashtagPages]);

  useEffect(() => {
    articleApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, article: articleApiResponse },
        rows: previous.rows,
      }));
  }, [articleApiResponse]);

  useEffect(() => {
    storeSectionApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, storeSection: storeSectionApiResponse },
        rows: previous.rows,
      }));
  }, [storeSectionApiResponse]);

  useEffect(() => {
    storeApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, store: storeApiResponse },
        rows: previous.rows,
      }));
  }, [storeApiResponse]);

  useEffect(() => {
    receiverApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, receiver: receiverApiResponse },
        rows: previous.rows,
      }));
  }, [receiverApiResponse]);

  useEffect(() => {
    imageContentApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, imageContent: imageContentApiResponse },
        rows: previous.rows,
      }));
  }, [imageContentApiResponse]);

  useEffect(() => {
    costunitApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, costunit: costunitApiResponse },
        rows: previous.rows,
      }));
  }, [costunitApiResponse]);

  useEffect(() => {
    attributeApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, attribute: attributeApiResponse },
        rows: previous.rows,
      }));
  }, [attributeApiResponse]);

  useEffect(() => {
    manufacturerApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, manufacturer: manufacturerApiResponse },
        rows: previous.rows,
      }));
  }, [manufacturerApiResponse]);

  useEffect(() => {
    hashtagApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, hashtag: hashtagApiResponse },
        rows: previous.rows,
      }));
  }, [hashtagApiResponse]);

  return masterdata;
};
