module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'subject-full-stop': [0, 'never', '.'],
    'body-max-line-length': [2, 'always', 200],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'revert',
        'build',
        'perf',
        'ci',
      ],
    ],
  },
};
