import { ffmpeg, additionalFiles } from "@trigger.dev/build/extensions/core"
import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
  project: "proj_bkbgkmawrweyhsrhoaur",
  build: {
    extensions: [
      ffmpeg(),
      additionalFiles({
        files: [
          "node_modules/.prisma/client/**/*",
          "node_modules/@prisma/client/**/*"
        ]
      })
    ],
  },
  dirs: ["./packages/background-jobs/src/tasks"],
  maxDuration: 5000,
})