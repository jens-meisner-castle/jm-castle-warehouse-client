import { Grid, Typography } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { useVerifiedUser } from "../../../auth/AuthorizationProvider";
import { AppAction } from "../../../components/AppActions";
import { SizeVariant } from "../../../components/SizeVariant";
import { EmissionsTable } from "../../../components/table/EmissionsTable";
import { ReceiptsTable } from "../../../components/table/ReceiptsTable";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useReceiptSelectBySectionAndArticle } from "../../../hooks/useReceiptSelectBySectionAndArticle";
import {
  EmissionRow,
  fromRawReceipt,
  ReceiptRow,
} from "../../../types/RowTypes";
import { RelocateState } from "../../Types";

export interface SummaryProps {
  data: RelocateState["data"];
  onChangeSummary: (moves: {
    emission: EmissionRow;
    receipt: ReceiptRow;
    originalReceipt: ReceiptRow;
  }) => void;
  description: string;
  actions: AppAction[];
  sizeVariant: SizeVariant;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const Summary = (props: SummaryProps) => {
  const {
    data,
    sizeVariant,
    handleExpiredToken,
    onChangeSummary,
    actions,
    description,
  } = props;

  const { username } = useVerifiedUser() || {};

  const { from, to, article, emission, receipt, originalReceipt } = data;

  const receiptsApiResponse = useReceiptSelectBySectionAndArticle(
    backendApiUrl,
    from?.sectionId,
    article?.articleId,
    1,
    handleExpiredToken
  );

  useEffect(() => {
    const { response } = receiptsApiResponse;
    const { result } = response || {};
    const { rows } = result || {};
    if (!rows) {
      return;
    }
    const sortedNewestFirst = [...rows].sort(
      (a, b) => b.receipt_at - a.receipt_at
    );
    const receiptsInSourceSection = sortedNewestFirst
      .slice(0, Math.min(3, rows.length))
      .map((r) => fromRawReceipt(r));
    if (!from || !to || !article || !username || !receiptsInSourceSection) {
      return;
    }
    const originalReceipt = receiptsInSourceSection[0];
    const emission: EmissionRow = {
      datasetId: "new",
      articleCount: originalReceipt.articleCount,
      articleId: article.articleId,
      byUser: username,
      costUnit: originalReceipt.costUnit,
      reason: "shift",
      sectionId: from.sectionId,
      receiver: username,
      emittedAt: new Date(),
      imageRefs: undefined,
      price: originalReceipt.price,
    };
    const receipt: ReceiptRow = {
      datasetId: "new",
      articleCount: originalReceipt.articleCount,
      articleId: article.articleId,
      byUser: username,
      costUnit: originalReceipt.costUnit,
      reason: "shift",
      sectionId: to.sectionId,
      receiptAt: new Date(),
      wwwLink: originalReceipt.wwwLink,
      guarantyTo: originalReceipt.guarantyTo,
      imageRefs: undefined,
      price: originalReceipt.price,
    };
    onChangeSummary({ emission, receipt, originalReceipt });
  }, [from, to, article, receiptsApiResponse, username, onChangeSummary]);

  const emissions = useMemo(() => (emission ? [emission] : []), [emission]);
  const receipts = useMemo(() => (receipt ? [receipt] : []), [receipt]);
  const originalReceipts = useMemo(
    () => (originalReceipt ? [originalReceipt] : []),
    [originalReceipt]
  );

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <Grid container direction="column">
          <Grid item textAlign={"center"}>
            <Typography>{"Ursprünglicher Wareneingang"}</Typography>
          </Grid>
          <Grid item>
            <ReceiptsTable
              data={originalReceipts || []}
              sizeVariant={sizeVariant}
              hidePagination
            />
          </Grid>
          <Grid item>
            <Grid item textAlign={"center"}>
              <div
                style={{
                  marginTop: 20,
                }}
              >
                <Typography>{"Neuer Warenausgang"}</Typography>
              </div>
            </Grid>
            <EmissionsTable
              data={emissions}
              sizeVariant={sizeVariant}
              hidePagination
            />
          </Grid>
          <Grid item>
            <Grid item textAlign={"center"}>
              <div style={{ marginTop: 20 }}>
                <Typography>{"Neuer Wareneingang"}</Typography>
              </div>
            </Grid>
            <ReceiptsTable
              data={receipts}
              sizeVariant={sizeVariant}
              hidePagination
            />
          </Grid>
        </Grid>
      </div>
    </ViewFrame>
  );
};
