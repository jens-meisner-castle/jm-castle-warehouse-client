import { useEffect, useState } from "react";
// eslint-disable-next-line
// @ts-ignore: disable-next-line
const { SpeechRecognition, webkitSpeechRecognition } = window || {};
const SpeechRecognitionConstructor =
  SpeechRecognition || webkitSpeechRecognition;

interface SpeechEvent {
  results: { transcript: string }[][];
}

interface ErrorEvent {
  whatever: unknown;
}

interface SpeechRecognitionInterface {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechEvent) => void;
  onerror: (event: ErrorEvent) => void;
  onspeechend: () => void;
}

export type SpeechInputResult =
  | {
      topic: string;
      text: string | undefined;
      error?: never;
      recognitionInProgress: boolean;
      cancel?: () => void;
    }
  | {
      topic: string;
      error: string;
      text?: never;
      recognitionInProgress: boolean;
      cancel?: () => void;
    };

export const useSpeechInput = (topic: string, updateIndicator: number) => {
  const [recognition, setRecognition] =
    useState<SpeechRecognitionInterface | null>(null);
  console.log(recognition && 1 > 2 && console.log("never"));
  const [result, setResult] = useState<SpeechInputResult>({
    topic,
    recognitionInProgress: false,
    text: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (!updateIndicator) {
      return;
    }
    const newRecognition: SpeechRecognitionInterface =
      new SpeechRecognitionConstructor();
    newRecognition.continuous = false;
    newRecognition.lang = "de-DE";
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;
    const cancel = () => {
      newRecognition.abort();
      setResult({ topic, recognitionInProgress: false, text: undefined });
    };
    setResult((previous) => ({
      recognitionInProgress: true,
      cancel,
      topic,
      text: previous.topic === topic ? previous.text : undefined,
    }));
    newRecognition.onresult = (event: SpeechEvent) => {
      const newText = event.results[0][0].transcript;
      setResult((previous) => ({
        topic: previous.topic,
        recognitionInProgress: previous.recognitionInProgress,
        text: newText,
      }));
    };
    newRecognition.onspeechend = () => {
      newRecognition.stop();
      setResult((previous) => ({ ...previous, recognitionInProgress: false }));
      setRecognition((previous) =>
        previous === newRecognition ? null : previous
      );
    };
    newRecognition.onerror = (event: ErrorEvent) => {
      newRecognition.stop();
      setResult({
        topic,
        error: event.toString(),
        recognitionInProgress: false,
      });
      console.log("Received error event from speech recognition: ", event);
    };
    setRecognition(newRecognition);
    newRecognition.start();
    return () => {
      newRecognition.stop();
    };
  }, [topic, updateIndicator]);

  return result;
};
