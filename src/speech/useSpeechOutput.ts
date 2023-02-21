import { useEffect } from "react";
// eslint-disable-next-line
// @ts-ignore: disable-next-line
const { speechSynthesis } = window || {};

export const useSpeechOutput = (text: string, updateIndicator: number) => {
  useEffect(() => {
    if (updateIndicator) {
      const utterText = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.voiceURI.match(/.*Katja.*/)) ||
        voices.find((v) => v.lang === "de-DE" && v.default);
      voice && (utterText.voice = voice);
      speechSynthesis.speak(utterText);
    }
  }, [text, updateIndicator]);

  return true;
};
