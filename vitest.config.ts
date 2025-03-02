import { codecovVitePlugin } from "@codecov/vite-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "grainsjs-test",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
