import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Alert, IconButton, Snackbar } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { useSpeechInput } from "../speech/useSpeechInput";

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
};

export const TextFieldWithSpeech = (props: TextFieldWithSpeechProps) => {
  const { label, value, onChange, helperText, ...textFieldProps } = props;

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
  }, [spokenInput, onChange]);

  const startSpeechInput = useCallback(() => {
    setSpeechInput((previous) => ({
      updateIndicator: previous.updateIndicator + 1,
    }));
  }, []);

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
              onClick={() => cancelSpeechInput && cancelSpeechInput()}
            >
              <MicOffIcon />
            </IconButton>
          ) : (
            <IconButton
              disabled={recognitionInProgress}
              onClick={() => startSpeechInput()}
            >
              <MicIcon />
            </IconButton>
          ),
        }}
        helperText={
          recognitionInProgress ? helperText || "Bitte sprechen Sie jetzt." : ""
        }
      />
    </>
  );
};
