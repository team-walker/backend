module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 실무 팁: 대소문자 검사로 인해 커밋이 막히는 피로도를 없애기 위해 '0(비활성화)'으로 설정합니다.
    // 팀원들이 자유롭게 "Fix API error"나 "update README" 등을 작성할 수 있습니다.
    'subject-case': [0],
  },
};
