import { ffmpeg } from "@trigger.dev/build/extensions/core"
import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
  project: "proj_bkbgkmawrweyhsrhoaur",
  build: {
    extensions: [ffmpeg()],
  },
  dirs: ["./packages/background-jobs/src/tasks"],
  maxDuration: 5000,
})