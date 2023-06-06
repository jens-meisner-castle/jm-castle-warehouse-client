import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

const certificateDirectory =
  "C:/development/git/jm-castle-warehouse-client/cert";
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // concrete host name was not working, but 0.0.0.0 works also for the host name
    host: "0.0.0.0",
    port: 3001,
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
