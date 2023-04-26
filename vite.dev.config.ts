import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

const certificateDirectory =
  "C:/development/git/jm-castle-warehouse-client/cert";
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "desktop-61mus1j",
    port: 5333,
    https: {
      cert: fs.readFileSync(
        path.join(certificateDirectory, "DESKTOP-61MUS1J.crt"),
        "utf-8"
      ),
      key: fs.readFileSync(
        path.join(certificateDirectory, "DESKTOP-61MUS1J.key"),
        "utf-8"
      ),
    },
  },
  plugins: [react()],
});
