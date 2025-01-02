import tsconfigPaths from "vite-tsconfig-paths";

const config: import("vite").UserConfig = {
  test: {
    environment: "jsdom"
  },
  esbuild: {
    jsxInject: "import { createElement, Fragment } from 'reactfree-jsx';"
  },
  plugins: [
    tsconfigPaths()
  ]
};

export default config;