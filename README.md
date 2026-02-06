# Team Walker Backend

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=flat&logo=swagger&logoColor=black)
![pnpm](https://img.shields.io/badge/pnpm-8.0-orange?style=flat&logo=pnpm&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)
![Husky](https://img.shields.io/badge/Husky-Git_Hooks-brown?style=flat&logo=git&logoColor=white)

> Walkavel 프로젝트의 백엔드 리포지토리입니다.

## 📑 목차

- [🛠 기술 스택](#-기술-스택)
- [📂 프로젝트 구조](#-프로젝트-구조)
- [🚀 시작하기](#-시작하기)
- [📝 협업 가이드](#-협업-가이드)
  - [1. 브랜치 전략](#1-브랜치-전략-git-flow)
  - [2. 커밋 컨벤션](#2-커밋-컨벤션-conventional-commits)
  - [3. PR 전략](#3-prpull-request-전략)
  - [4. 코딩 컨벤션](#4-코딩--스타일-컨벤션)
  - [5. CI/CD](#5-cicd-github-actions)
  - [6. 스프린트 운영](#6-스프린트-및-통합-주기-sprint--integration)
- [⚡️ 빠른 참조](#️-빠른-참조)

---

## 🛠 기술 스택

| Category                 | Technology                         |
| ------------------------ | ---------------------------------- |
| **Framework**            | NestJS 11                          |
| **Language**             | TypeScript                         |
| **API Documentation**    | Swagger (OpenAPI)                  |
| **Package Manager**      | pnpm                               |
| **Linting & Formatting** | ESLint, Prettier                   |
| **Validation**           | class-validator, class-transformer |
| **Git Hooks**            | Husky, Commitlint, lint-staged     |

## 📂 프로젝트 구조

```bash
├── .github/          # GitHub Actions, PR/Issue Templates
├── src/              # Application source code
│   ├── auth/         # 인증 관련 (Guards, Controllers, Services)
│   ├── tour/         # 여행 데이터 관련 (Landmark API, Sync 로직)
│   ├── supabase/     # Supabase 연동 및 설정
│   ├── utils/        # 공통 유틸리티 (Error handling 등)
│   ├── main.ts       # Entry point
│   ├── setup-swagger.ts # Swagger API 문서 설정
│   ├── app.module.ts # Root module
│   └── ...
├── test/             # E2E tests
└── ...
```

## 🚀 시작하기

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고, 필요한 환경 변수 값을 설정합니다.

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

```bash
pnpm start # or pnpm start:dev
```

> [!TIP]
> 개발 환경에서는 소스 코드 변경 시 실시간으로 반영되는 `pnpm start:dev` 명령어를 사용하는 것을 권장합니다.

### 4. 테스트 실행

```bash
pnpm test
```

API 문서는 [http://localhost:3001/docs](http://localhost:3001/docs)에서 확인하세요.

---

## 📝 협업 가이드

팀원들과 함께 사용할 협업 규칙 및 컨벤션입니다.

## 1. 브랜치 전략 (Git Flow)

> **Git Flow** 전략을 기반으로 운영합니다.

### 브랜치 종류

| 브랜치                      | 용도                         | 직접 Push           |
| --------------------------- | ---------------------------- | ------------------- |
| **`main`**                  | 배포 가능한 프로덕션 코드    | ❌ 금지             |
| **`develop`**               | 다음 배포를 위한 개발 브랜치 | ❌ 금지 (PR만 가능) |
| **`feat/#이슈번호-기능명`** | 기능 개발                    | ✅ 가능             |
| **`fix/#이슈번호-버그명`**  | 버그 수정                    | ✅ 가능             |

### 브랜치 네이밍 예시

```bash
feat/#12-auth-api
feat/#23-user-schema
fix/#15-db-migration
fix/#34-api-error-handling
```

### 📌 작업 프로세스

```
1. 이슈(Issue) 생성
   ↓
2. develop 브랜치 최신화
   git pull origin develop
   ↓
3. 작업 브랜치 생성
   git checkout -b feat/#이슈번호-기능명
   ↓
4. 작업 및 커밋
   ↓
5. 원격 저장소 푸시
   git push origin feat/#이슈번호-기능명
   ↓
6. PR 생성 (작업 브랜치 → develop)
```

## 2. 커밋 컨벤션 (Conventional Commits)

> **⚠️ 중요**: 자동화 도구(`commitlint`, `husky`)에 의해 커밋 메시지 규칙이 강제됩니다.

### 커밋 메시지 형식

```
type: subject
```

- **`type`은 필수이며 소문자로 작성**
- **`subject`는 대소문자 구분 없이 작성 가능** (API, UI 등 고유명사 사용 가능)
- `type`과 `subject` 사이에 콜론(`:`)과 공백 한 칸
- 제목 끝에 **마침표(`.`) 사용 가능** (선택 사항)
- **본문(body) 최대 200자**까지 작성 가능 (유연한 설명 기재 가능)

### Type 종류

| Type       | 설명                                           | 예시                                       |
| ---------- | ---------------------------------------------- | ------------------------------------------ |
| `feat`     | 새로운 기능 추가                               | `feat: implement login api`                |
| `fix`      | 버그 수정                                      | `fix: resolve db connection issue`         |
| `docs`     | 문서 수정 (README, 주석 등)                    | `docs: update readme installation guide`   |
| `style`    | 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음) | `style: format code with prettier`         |
| `refactor` | 코드 리팩토링 (기능 변경 없음)                 | `refactor: simplify user validation logic` |
| `test`     | 테스트 코드 추가/수정                          | `test: add unit tests for auth service`    |
| `chore`    | 빌드 업무, 패키지 매니저 설정 등               | `chore: update dependencies`               |
| `perf`     | 성능 개선                                      | `perf: optimize database queries`          |
| `ci`       | CI 구성 파일 및 스크립트 변경                  | `ci: update github actions workflow`       |
| `revert`   | 커밋 되돌리기                                  | `revert: undo previous commit`             |

### 커밋 단위 (Atomic Commit)

✅ **DO**

- 하나의 커밋은 **하나의 변경 사항**만 포함
- **작은 단위로 자주 커밋**
- 각 커밋이 독립적으로 동작 가능하도록

❌ **DON'T**

- 여러 기능을 한 커밋에 섞지 않기
- 기능 구현과 스타일 수정을 같이 커밋하지 않기

### 좋은 커밋 예시

```bash
✅ feat: add auth module
✅ fix: resolve api timeout error
✅ style: format code with prettier
```

### 나쁜 커밋 예시

```bash
❌ FEAT: add login (type을 대문자로 작성)
❌ feat:add login (공백 없음)
❌ add login (type 누락)
❌ feat: add login, fix db connection, update config (여러 작업 혼재)
```

## 3. PR(Pull Request) 전략

> PR 템플릿이 설정되어 있습니다. 내용을 충실히 작성해주세요.

### PR 제목 형식

```
type: 요약 #이슈번호
```

**예시**: `feat: 사용자 인증 API 구현 #23`

### PR 작성 체크리스트

- [ ] **Reviewers**: 팀원 전체 지정
- [ ] **Assignees**: 자동으로 본인이 지정됨 (Github Actions)
- [ ] **Labels**: 작업 성격에 맞는 라벨(`feat`, `bug` 등) 추가
- [ ] **Linked Issues**: 본문에 `Close #이슈번호` 작성하여 이슈 자동 닫기 연결
- [ ] **Description**: PR 템플릿에 따라 변경사항 상세히 작성

### 리뷰 & 병합 규칙

| 단계            | 내용                                                   |
| --------------- | ------------------------------------------------------ |
| **1차 리뷰**    | AI 코드 리뷰(Gemini Code Assist) 필수 진행             |
| **2차 리뷰**    | 최소 **1명 이상**의 팀원 승인(Approve) 필요            |
| **리뷰 포인트** | 코드의 논리적 오류, 컨벤션 준수, 테스트 코드 작성 여부 |
| **병합 방식**   | `Squash and Merge` 권장 (커밋 히스토리 정리)           |

### 💡 Gemini AI Bot 활용 팁

- **자동 리뷰**: PR 생성 시 Gemini 봇이 자동으로 1차 리뷰 진행
- **추가 질문**: `@gemini-code-assist`를 태그하여 특정 코드에 대해 질문 가능
- **명령어**:
  - `/gemini review` - 새로운 리뷰 요청
  - `/gemini summary` - 변경 사항 요약 요청

## 4. 코딩 & 스타일 컨벤션

### 자동 검사 도구

- **ESLint & Prettier**: 커밋 전 `husky`에 의해 자동 검사
- **IDE 설정 권장**: "저장 시 자동 포맷팅(Auto Fix on Save)" 활성화

### 네이밍 컨벤션

| 대상                 | 규칙             | 예시                               |
| -------------------- | ---------------- | ---------------------------------- |
| **클래스 (Class)**   | PascalCase       | `AppController`, `AuthService`     |
| **함수 (Function)**  | camelCase        | `getHello`, `validateUser`         |
| **상수 (Constant)**  | UPPER_SNAKE_CASE | `API_TIMEOUT`, `MAX_RETRY`         |
| **파일 (File)**      | kebab-case       | `app.module.ts`, `auth.service.ts` |
| **폴더 (Directory)** | kebab-case       | `auth`, `common`                   |

### 코드 작성 원칙

1. **명확한 변수명 사용**: 축약어보다는 의미 있는 이름
2. **함수는 단일 책임**: 하나의 함수는 하나의 역할만
3. **주석은 Why, not What**: 코드가 무엇을 하는지보다 왜 그렇게 했는지 설명
4. **Early Return 패턴 사용**: 중첩 if문보다는 조기 반환

## 5. CI/CD (Github Actions)

### 자동 실행 작업

PR 생성 및 푸시 시 자동으로 다음 작업이 실행됩니다:

- ✅ **Build**: 빌드 성공 여부 확인
- ✅ **Lint**: ESLint 및 Prettier 검사
- ✅ **Test**: 테스트 코드 통과 여부

> **⚠️ 주의**: 테스트를 통과하지 못하면 Merge가 제한됩니다.

### Git Hooks (로컬 검사)

`Husky`와 `lint-staged`를 통해 커밋 전 자동 검사:

- **Pre-commit**: Lint 및 Formatting 자동 검사
- **Commit-msg**: 커밋 메시지 규칙 검증

규칙 위반 시 커밋이 중단되므로, 에러 메시지를 확인하여 수정 후 재시도하세요.

## 6. 스프린트 및 통합 주기 (Sprint & Integration)

> **1주 단위 스프린트**로 개발 및 배포를 진행합니다.

### 통합 방식

#### 상시 통합 (Continuous Integration)

- 개별 기능 개발 완료 시 **즉시** PR을 통해 `develop` 브랜치에 병합
- ⚠️ **충돌 방지**: 스프린트 마지막 날에 몰아서 병합하지 않습니다

#### 정기 배포 (End of Sprint)

- 스프린트 종료 시 `develop` → `main` 병합하여 배포

### 스프린트 프로세스 (1주 단위 예시)

```
월요일 (Sprint Start)
  └─ PO가 할당한 백로그 확인 및 작업 시작
     ↓
월~목 (Development)
  └─ feat 브랜치 작업 → develop으로 지속적 병합
     ↓
금요일 오전 (Code Freeze)
  └─ 새로운 기능 병합 중단
  └─ QA (테스트 코드 통과 및 수동 점검)
  └─ 버그 수정
     ↓
금요일 오후 (Release)
  └─ QA 통과 후 main 브랜치 병합 및 배포
```

> _위 일정은 프로젝트 상황에 따라 유연하게 변경될 수 있습니다._

---

## ⚡️ 빠른 참조

### 자주 사용하는 Git 명령어

```bash
# 브랜치 생성 및 이동
git checkout -b feat/#이슈번호-기능명

# develop 브랜치 최신화
git pull origin develop

# 현재 브랜치를 develop 기준으로 리베이스
git rebase develop

# 커밋 후 푸시
git add .
git commit -m "feat: implement login api"
git push origin feat/#이슈번호-기능명

# 브랜치 삭제 (병합 후)
git branch -d feat/#이슈번호-기능명
```

### 문제 해결

#### 커밋이 안 될 때

1. 린트 에러 확인: `pnpm lint`
2. 포맷팅 자동 수정: `pnpm format`
3. 커밋 메시지 형식 확인
   - `type`은 반드시 소문자 (예: `feat:`, `fix:`)
   - `type` 뒤 콜론(`:`)과 **공백 한 칸** 필수
   - `subject`는 대문자/마침표 포함 가능

#### 충돌(Conflict) 발생 시

1. `git pull origin develop`로 최신 코드 받기
2. 충돌 파일 수동 해결
3. `git add .` 후 `git commit`
4. `git push`

#### 빌드 실패 시

1. `node_modules` 삭제 후 재설치: `rm -rf node_modules && pnpm install`
2. `dist` 폴더 삭제 후 재빌드: `rm -rf dist && pnpm build`
3. 환경 변수 확인: `.env` 파일 존재 및 내용 확인
