module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'screen'],
      },
    ],
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'color-hex-length': null,
    'value-keyword-case': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'at-rule-empty-line-before': null,
  },
}
