// app.config.js
export default ({ config }) => ({
  ...config,
  name: process.env.APP_NAME || "Master App",
  slug: process.env.APP_SLUG || "011",
  version: "1.0.0",
});
