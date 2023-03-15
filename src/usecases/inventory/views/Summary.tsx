import { Grid, Typography } from "@mui/material";
import { AppAction } from "jm-castle-components/build";
import { useEffect } from "react";
import { useVerifiedUser } from "../../../auth/AuthorizationProvider";
import { SizeVariant } from "../../../components/SizeVariant";
import { EmissionsTable } from "../../../components/table/EmissionsTable";
import { ReceiptsTable } from "../../../components/table/ReceiptsTable";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { EmissionRow, ReceiptRow } from "../../../types/RowTypes";
import { InventoryState } from "../../Types";

export interface SummaryProps {
  data: InventoryState["data"];
  onChangeSummary: (moves: {
    emissions: EmissionRow[];
    receipts: ReceiptRow[];
  }) => void;
  description: string;
  actions: AppAction[];
  sizeVariant: SizeVariant;
}

export const Summary = (props: SummaryProps) => {
  const { data, sizeVariant, onChangeSummary, actions, description } = props;

  const { username } = useVerifiedUser() || {};

  const { article, emissions, receipts, sectionDifferences } = data;

  useEffect(() => {
    if (!sectionDifferences || !article || !username) return;
    const emissions: EmissionRow[] = [];
    const receipts: ReceiptRow[] = [];
    sectionDifferences.forEach((d) => {
      if (
        !(typeof d.newValue === "number") ||
        d.currentValue === d.newValue ||
        !d.costUnit
      )
        return;
      if (d.currentValue > d.newValue) {
        const emission: EmissionRow = {
          datasetId: "new",
          articleCount: d.currentValue - d.newValue,
          articleId: article.articleId,
          byUser: username,
          costUnit: d.costUnit,
          reason: "inventory",
          sectionId: d.sectionId,
          receiver: username,
          emittedAt: new Date(),
          imageRefs: undefined,
          price: undefined,
        };
        emissions.push(emission);
      }
      if (d.currentValue < d.newValue) {
        const receipt: ReceiptRow = {
          datasetId: "new",
          articleCount: d.newValue - d.currentValue,
          articleId: article.articleId,
          byUser: username,
          costUnit: d.costUnit,
          reason: "inventory",
          sectionId: d.sectionId,
          receiptAt: new Date(),
          wwwLink: undefined,
          guarantyTo: undefined,
          imageRefs: undefined,
          price: undefined,
        };
        receipts.push(receipt);
      }
    });
    onChangeSummary({ emissions, receipts });
  }, [article, sectionDifferences, onChangeSummary, username]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <Grid container direction="column">
          {!!emissions?.length && (
            <>
              <Grid item textAlign={"center"}>
                <div
                  style={{
                    marginTop: 20,
                  }}
                >
                  <Typography>{"Neue Warenausgänge"}</Typography>
                </div>
              </Grid>
              <Grid item>
                <EmissionsTable
                  data={emissions || []}
                  sizeVariant={sizeVariant}
                  hidePagination
                />
              </Grid>
            </>
          )}
          {!!receipts?.length && (
            <>
              <Grid item textAlign={"center"}>
                <div style={{ marginTop: 20 }}>
                  <Typography>{"Neue Wareneingänge"}</Typography>
                </div>
              </Grid>
              <Grid item>
                <ReceiptsTable
                  data={receipts || []}
                  sizeVariant={sizeVariant}
                  hidePagination
                />
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </ViewFrame>
  );
};
