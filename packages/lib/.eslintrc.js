module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  extends: ["@sondr3/eslint-config/typescript", "plugin:jest/recommended", "plugin:jest/style"],
}
