import AddBoxIcon from "@mui/icons-material/AddBox";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppAction } from "../../../components/AppActions";
import { CostunitRefAutocomplete } from "../../../components/autocomplete/CostunitRefAutocomplete";
import { StoreSectionRefAutocomplete } from "../../../components/autocomplete/StoreSectionRefAutocomplete";
import { CountField } from "../../../components/CountField";
import { ErrorData } from "../../../components/ErrorDisplays";
import { SizeVariant } from "../../../components/SizeVariant";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useStockArticleSelect } from "../../../hooks/useStockArticleSelect";
import {
  ArticleRow,
  CostunitRow,
  StoreSectionRow,
} from "../../../types/RowTypes";
import { SectionDifference } from "../../Types";

export interface EditArticleStockStatesProps {
  article: ArticleRow | undefined;
  availableSections: StoreSectionRow[];
  sectionDifferences: SectionDifference[];
  availableCostunits: CostunitRow[];
  onChangeSectionDifferences: (data: SectionDifference[]) => void;
  sizeVariant: SizeVariant;
  description: string;
  actions: AppAction[];
  onError: (errorData: Record<string, ErrorData>) => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const EditArticleStockStates = (props: EditArticleStockStatesProps) => {
  const {
    article,
    availableSections,
    availableCostunits,
    sectionDifferences,
    onChangeSectionDifferences,
    description,
    actions,
    onError,
    handleExpiredToken,
  } = props;

  const [selectedSection, setSelectedSection] =
    useState<StoreSectionRow | null>(null);

  const availableSectionsToAdd = useMemo(() => {
    if (!sectionDifferences) return undefined;
    return availableSections.filter(
      (section) =>
        !sectionDifferences.find((d) => d.sectionId === section.sectionId)
    );
  }, [availableSections, sectionDifferences]);

  const addSelectedSection = useCallback(() => {
    if (selectedSection) {
      const newDiff: SectionDifference = {
        sectionId: selectedSection.sectionId,
        currentValue: 0,
        newValue: 0,
        costUnit: null,
      };
      onChangeSectionDifferences([...sectionDifferences, newDiff]);
      setSelectedSection(null);
    }
  }, [selectedSection, onChangeSectionDifferences, sectionDifferences]);

  const { articleId, name } = article || {};

  const stockApiResponse = useStockArticleSelect(
    backendApiUrl,
    articleId,
    1,
    handleExpiredToken
  );
  const { response } = stockApiResponse;
  const { states: sectionStates } = response || {};

  useEffect(() => {
    if (sectionStates) {
      onChangeSectionDifferences(
        sectionStates.map((state) => ({
          sectionId: state.section.section_id,
          currentValue: state.physicalCount,
          newValue: state.physicalCount,
          costUnit: null,
        }))
      );
    }
  }, [sectionStates, onChangeSectionDifferences]);

  const updateSectionDifferences = useCallback(
    (sectionId: string, newValue: number | null, costUnit: string | null) => {
      const index = sectionDifferences.findIndex(
        (d) => d.sectionId === sectionId
      );
      if (index < 0) {
        console.log(
          `Fatal error. Section ${sectionId} not found in sectionDifferences.`
        );
        return;
      }

      const newSectionDifferences = [
        ...sectionDifferences.slice(0, index),
        { ...sectionDifferences[index], newValue, costUnit },
        ...sectionDifferences.slice(
          Math.min(sectionDifferences.length, index + 1),
          sectionDifferences.length
        ),
      ];
      onChangeSectionDifferences(newSectionDifferences);
    },
    [sectionDifferences, onChangeSectionDifferences]
  );

  useEffect(() => {
    if (stockApiResponse.error) {
      return onError({ stock: stockApiResponse });
    }
  }, [stockApiResponse, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <Accordion expanded={true}>
          <AccordionSummary>
            <Typography>{articleId}</Typography>
            <Typography
              sx={{
                color: "text.secondary",
                marginLeft: 1,
              }}
            >
              {name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ paddingBottom: 10 }}>
              <Grid container direction="row" alignItems="end">
                <Grid item minWidth={250}>
                  <StoreSectionRefAutocomplete
                    label="Lagerbereich hinzufügen"
                    sections={availableSectionsToAdd || []}
                    value={selectedSection}
                    onChange={setSelectedSection}
                    fullWidth
                    variant="standard"
                    margin="dense"
                  />
                </Grid>
                <Grid item>
                  <Button
                    style={{ marginLeft: 20 }}
                    disabled={!selectedSection}
                    onClick={addSelectedSection}
                    variant="contained"
                  >
                    <AddBoxIcon />
                  </Button>
                </Grid>
              </Grid>
            </div>
            <>
              {sectionDifferences.map((state) => {
                const { sectionId, currentValue, newValue, costUnit } = state;

                return (
                  <Grid container direction="column" key={sectionId}>
                    <Grid item>
                      <Typography>{`Lagerbereich ${sectionId}`}</Typography>
                    </Grid>
                    <Grid item>
                      <div style={{ padding: 10 }}>
                        <Grid container direction="row">
                          <Grid item>
                            <div style={{ padding: 10 }}>
                              <CountField
                                label="Anzahl im Lager"
                                disabled
                                style={{ marginLeft: 10 }}
                                value={currentValue}
                                onChange={() => console.log("ignored")}
                              />
                            </div>
                          </Grid>
                          <Grid item>
                            <div style={{ padding: 10 }}>
                              <CountField
                                label="tatsächliche Anzahl"
                                style={{ marginLeft: 10 }}
                                value={newValue}
                                onChange={(value) =>
                                  updateSectionDifferences(
                                    sectionId,
                                    value,
                                    costUnit
                                  )
                                }
                              />
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                    <Grid item>
                      <div style={{ padding: 10 }}>
                        <Grid container direction="row">
                          <Grid item minWidth={250}>
                            <div style={{ padding: 10 }}>
                              <CostunitRefAutocomplete
                                label="Kostenstelle"
                                fullWidth
                                style={{ marginLeft: 10 }}
                                value={availableCostunits.find(
                                  (unit) => unit.unitId === costUnit
                                )}
                                costunits={availableCostunits}
                                onChange={(costUnit) =>
                                  updateSectionDifferences(
                                    sectionId,
                                    newValue,
                                    costUnit?.unitId || null
                                  )
                                }
                              />
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                  </Grid>
                );
              })}
            </>
          </AccordionDetails>
        </Accordion>
      </div>
    </ViewFrame>
  );
};
