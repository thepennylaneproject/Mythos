const path = require("path");

module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  settings: {
    next: {
      rootDir: ["apps/web/"],
    },
  },
  parserOptions: {
    // Keep project resolution stable across the monorepo.
    project: path.join(__dirname, "../../apps/web/tsconfig.json"),
  },
  rules: {},
};
