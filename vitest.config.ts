import tsconfigPaths from "vite-tsconfig-paths";

const config: import("vite").UserConfig = {
  test: {
    environment: "jsdom"
  },
  plugins: [
    tsconfigPaths()
  ]
};

export default config;