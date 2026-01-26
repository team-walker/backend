module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0], // Disable subject-case to support Korean and acronyms like README/PR
  },
};
