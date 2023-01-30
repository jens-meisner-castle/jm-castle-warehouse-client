import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Alert, IconButton, Snackbar } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { CSSProperties, useCallback, useEffect, useState } from "react";
import { useSpeechInput } from "../speech/useSpeechInput";
import { ErrorData } from "./ErrorDisplays";

export type TextFieldWithSpeechProps = Omit<
  Omit<
    Omit<
      Omit<Omit<Omit<TextFieldProps, "onChange">, "onError">, "value">,
      "label"
    >,
    "type"
  >,
  "InputProps"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorData?: ErrorData;
};

export const TextFieldWithSpeech = (props: TextFieldWithSpeechProps) => {
  const { label, value, onChange, errorData, helperText, ...textFieldProps } =
    props;

  const iconButtonStyle: CSSProperties = { padding: 4 };

  const [speechInput, setSpeechInput] = useState<{
    updateIndicator: number;
  }>({ updateIndicator: 0 });

  const {
    text: spokenInput,
    error: speechInputError,
    recognitionInProgress,
    cancel: cancelSpeechInput,
  } = useSpeechInput("text", speechInput.updateIndicator);

  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);

  useEffect(() => {
    speechInputError && setIsAnySnackbarOpen(true);
  }, [speechInputError]);

  useEffect(() => {
    if (!spokenInput) {
      return;
    }
    onChange(spokenInput);
    setSpeechInput({ updateIndicator: 0 });
  }, [spokenInput, onChange]);

  const startSpeechInput = useCallback(() => {
    setSpeechInput((previous) => ({
      updateIndicator: previous.updateIndicator + 1,
    }));
  }, []);

  const { error } = errorData || {};
  const usedHelperText = recognitionInProgress
    ? "Bitte sprechen Sie jetzt."
    : error || helperText || "";

  return (
    <>
      {speechInputError && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler bei der Spracheingabe: ${speechInputError}`}</Alert>
        </Snackbar>
      )}
      <TextField
        {...textFieldProps}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        InputProps={{
          endAdornment: recognitionInProgress ? (
            <IconButton
              style={iconButtonStyle}
              tabIndex={-1}
              onClick={() => cancelSpeechInput && cancelSpeechInput()}
            >
              <MicOffIcon />
            </IconButton>
          ) : (
            <IconButton
              style={iconButtonStyle}
              tabIndex={-1}
              disabled={recognitionInProgress}
              onClick={() => startSpeechInput()}
            >
              <MicIcon />
            </IconButton>
          ),
        }}
        error={!!error}
        helperText={usedHelperText}
      />
    </>
  );
};
