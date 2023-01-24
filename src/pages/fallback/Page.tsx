import { Grid, Paper, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifiedUser } from "../../auth/AuthorizationProvider";
import { TextComponent } from "../../components/TextComponent";
import { allRoutes } from "../../navigation/AppRoutes";

export type ProgressState =
  | { stateId: "initial" }
  | { stateId: "logged-in" }
  | { stateId: "try-navigate" }
  | { stateId: "finished" };

const getText = (progress: ProgressState, path: string, isLegal: boolean) => {
  switch (progress.stateId) {
    case "initial":
      return isLegal
        ? `Der Pfad ${path} ist aktuell nicht verfügbar. Warte auf automatisches Login...`
        : `Der Pfad ${path} existiert nicht im System.`;
    case "logged-in":
      return "Good news: You are logged in.";
    case "try-navigate":
      return "Will try to navigate to chosen location...";
    case "finished":
      return isLegal
        ? `Der Pfad ${path} ist aktuell nicht verfügbar. Bitte loggen Sie sich ein.`
        : `Der Pfad ${path} existiert nicht im System.`;
  }
};

export const Page = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const verifiedUser = useVerifiedUser();

  const [initialPathname] = useState(pathname);

  const isLegalPathname = useMemo(() => {
    const all = allRoutes();
    return !!Object.keys(all).find(
      (k) => all[k as keyof typeof all].path === initialPathname
    );
  }, [initialPathname]);

  console.log("initial", initialPathname);

  const [progress, setProgress] = useState<ProgressState>({
    stateId: "initial",
  });
  const [timedOut, setTimedOut] = useState(false);
  const { stateId } = progress;

  /** Navigate initially to fallback, so that navigate after login has an effect. */
  useEffect(() => {
    stateId === "initial" &&
      navigate(allRoutes().fallback.path, { replace: true });
  }, [navigate, initialPathname, stateId]);

  useEffect(() => {
    verifiedUser && setProgress({ stateId: "logged-in" });
  }, [verifiedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (timedOut && stateId === "initial") {
      // kein log in
      navigate(allRoutes().login.path, { replace: true });
    }
  }, [timedOut, stateId, navigate]);

  useEffect(() => {
    switch (stateId) {
      case "logged-in":
        return setProgress({ stateId: "try-navigate" });
      case "try-navigate": {
        setProgress({ stateId: "finished" });
        navigate(
          initialPathname !== allRoutes().fallback.path
            ? initialPathname
            : allRoutes().login.path,
          { replace: true }
        );
        break;
      }
      case "finished": {
        isLegalPathname && navigate(allRoutes().login.path, { replace: true });
      }
    }
  }, [stateId, navigate, isLegalPathname, initialPathname]);

  console.log(progress);

  const text = getText(progress, initialPathname, isLegalPathname);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Fallback page"}</Typography>
        <Paper>
          <div style={{ alignContent: "space-around", alignItems: "center" }}>
            <TextComponent
              value={text}
              fullWidth
              multiline
              inputProps={{ style: { textAlign: "center" } }}
            />
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};
