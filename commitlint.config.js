module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 0: 끔, 1: 경고, 2: 에러

    // 대소문자 검사 끄기 (API, UI 등 고유명사 사용 편의성)
    'subject-case': [0],

    // 제목 끝에 마침표(.) 금지 규칙 끄기 (실수로 찍어도 넘어가도록)
    'subject-full-stop': [0, 'never', '.'],

    // 본문 최대 길이 제한 늘리기 (기본 100자는 너무 짧을 수 있음)
    'body-max-line-length': [0, 'always', 200],

    // 타입(feat, fix 등)은 중요하므로 강제
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능 추가
        'fix', // 버그 수정
        'docs', // 문서 수정 (README, 문서 등)
        'style', // 코드 스타일 변경 (포맷팅, 세미콜론 누락 등 - 로직 변경 없음)
        'refactor', // 코드 리팩토링 (기능 변경 없음)
        'test', // 테스트 코드 추가/수정
        'chore', // 기타 변경사항 (빌드 스크립트, 패키지 매니저 설정 등)
        'revert', // 커밋 되돌리기
        'perf', // 성능 개선
        'ci', // CI 설정 파일 수정 (GitHub Actions, Husky 등)
        'init', // 프로젝트 초기 생성
      ],
    ],
  },
};
