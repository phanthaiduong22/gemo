module.exports = {
  apps: [
    {
      name: "pricing_be",
      script: "index.js",
      env: {
        PORT: 8005,
        NODE_ENV: "production",
      },
    },
  ],
};
