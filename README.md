# Team Walker Backend

> Team Walker 프로젝트의 백엔드 리포지토리입니다.

## 📑 Index

- [Team Walker Backend](#team-walker-backend)
  - [🛠 Tech Stack](#-tech-stack)
  - [📂 Project Structure](#-project-structure)
  - [🚀 Getting Started](#-getting-started)
- [📝 Team Collaboration Guidelines](#-team-collaboration-guidelines)
  - [1. 브랜치 전략 (Git Flow)](#1-브랜치-전략-git-flow)
  - [2. 커밋 컨벤션 (Conventional Commits)](#2-커밋-컨벤션-conventional-commits)
  - [3. PR(Pull Request) 전략](#3-prpull-request-전략)
  - [4. 코딩 & 스타일 컨벤션](#4-코딩--스타일-컨벤션)
  - [5. CI/CD (Github Actions)](#5-cicd-github-actions)
  - [6. 스프린트 및 통합 주기 (Sprint & Integration)](#6-스프린트-및-통합-주기-sprint--integration)

## 🛠 Tech Stack

| Category                 | Technology                     |
| ------------------------ | ------------------------------ |
| **Framework**            | NestJS 11                      |
| **Language**             | TypeScript                     |
| **API Documentation**    | Swagger (OpenAPI)              |
| **Package Manager**      | pnpm                           |
| **Linting & Formatting** | ESLint, Prettier               |
| **Git Hooks**            | Husky, Commitlint, lint-staged |

## 📂 Project Structure

```bash
├── .github/          # Github Actions & Templates
├── src/              # Application source code
│   ├── main.ts       # Entry point
│   ├── app.module.ts # Core module
│   └── ...
├── test/             # E2E tests
└── ...
```

## 🚀 Getting Started

### 1. Installation

```bash
pnpm install
```

### 2. Configure Environment

`.env.example` 파일을 `.env`로 복사하고, 필요한 환경 변수 값을 설정합니다.

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
pnpm start # or pnpm start:dev
```

> [!TIP]
> 개발 환경에서는 소스 코드 변경 시 실시간으로 반영되는 `pnpm start:dev` 명령어를 사용하는 것을 권장합니다.

### 4. Run Tests

```bash
pnpm test
```

API 문서는 [http://localhost:3000/docs](http://localhost:3000/docs)에서 확인하세요.

---

# 📝 Team Collaboration Guidelines

팀원들과 함께 사용할 협업 규칙 및 컨벤션입니다.

## 1. 브랜치 전략 (Git Flow)

> **Git Flow** 전략을 기반으로 운영합니다.

- **`main`**: 배포 가능한 상태의 프로덕션 코드. (직접 push 금지)
- **`develop`**: 다음 배포를 위한 개발 진행 브랜치. 모든 기능 관련 PR은 여기로 향합니다.
- **Feature Branch**: 기능 개발을 위한 브랜치.
  - 규칙: `feat/#이슈번호-기능명`
  - 예시: `feat/#12-login-page`
- **Fix Branch**: 버그 수정을 위한 브랜치.
  - 규칙: `fix/#이슈번호-버그명`
  - 예시: `fix/#15-header-alignment`

### 작업 순서

1. 이슈(Issue) 생성 (작업 내용 정의)
2. `develop` 브랜치에서 최신화 (`git pull origin develop`)
3. 작업 브랜치 생성 (`git checkout -b feat/#이슈번호-기능명`)
4. 작업 및 커밋
5. 원격 저장소 푸시 (`git push origin feat/#이슈번호-기능명`)
6. PR 생성 (`Feature Branch` → `develop`)

## 2. 커밋 컨벤션 (Conventional Commits)

자동화 도구(`commitlint`, `husky`)에 의해 커밋 메시지 규칙이 강제됩니다.

**형식**: `type: subject` (필요시 body, footer 추가)

- **모두 소문자로 작성**해야 합니다. (대문자 사용 불가)

| Type       | 설명                                           |
| ---------- | ---------------------------------------------- |
| `feat`     | 새로운 기능 추가                               |
| `fix`      | 버그 수정                                      |
| `docs`     | 문서 수정 (README, 주석 등)                    |
| `style`    | 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 (기능 변경 없음)                 |
| `test`     | 테스트 코드 추가/수정                          |
| `chore`    | 빌드 업무, 패키지 매니저 설정 등               |

### 커밋 단위 (Atomic Commit)

- **가능한 작은 단위로 커밋**하세요.
- 하나의 커밋은 **하나의 변경 사항**만 담아야 합니다. (예: 기능 구현과 스타일 수정을 섞지 않기)
- 이렇게 하면 코드 리뷰가 쉬워지고, 문제 발생 시 추적(git bisect)이나 롤백이 용이해집니다.

## 3. PR(Pull Request) 전략

PR 템플릿이 설정되어 있습니다. 내용을 충실히 작성해주세요.

### 기본 규칙

- **제목**: `type: 요약 #이슈번호` (예: `feat: 메인 배너 구현 #23`)
- **Reviewers**: 팀원 전체 지정
- **Assignees**: 자동으로 본인이 지정됨 (Github Actions)
- **Labels**: 작업 성격에 맞는 라벨(`feat`, `bug` 등) 추가
- **Linked Issues**: `Close #이슈번호`를 본문에 작성하여 이슈 자동 닫기 연결

### 리뷰 & 병합

- 최소 **1명 이상의 승인(Approve)**이 있어야 병합 가능
- **AI 코드 리뷰(Gemini Code Assist)**를 필수로 진행하여 1차 검증
- 리뷰어는 **코드의 논리적 오류, 컨벤션 준수 여부, 테스트 코드 작성 여부** 등을 확인
- `Squash and Merge` 전략 사용 권장 (커밋 히스토리 깔끔하게 유지)

## 4. 코딩 & 스타일 컨벤션

### 주요 컨벤션

- **ESLint & Prettier**: `husky`에 의해 커밋 전 자동 검사됨.
- **네이밍**:
  - **클래스 (Controller, Service, Module 등)**: PascalCase (예: `UserController`, `AuthService`)
  - **함수/메서드/변수**: camelCase (예: `getUserData`)
  - **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
  - **파일/폴더**: kebab-case 사용 및 접미사 명시 (예: `user.controller.ts`, `create-user.dto.ts`)

## 5. CI/CD (Github Actions)

- PR 생성 및 푸시 시 자동으로 **빌드(`build`)** 및 **린트(`lint`)** 작업이 실행됩니다 (`ci.yml`).
- 테스트를 통과하지 못하면 Merge가 제한될 수 있습니다.

### Git Hooks & Local Quality

- `Husky`와 `lint-staged`를 통해 커밋 전 자동으로 **Lint 및 Formatting** 검사가 수행됩니다.
- 규칙에 어긋나는 코드가 있을 경우 커밋이 중단되므로, 에러 메시지를 확인하여 수정 후 다시 커밋해 주세요.
- _팁: IDE의 "저장 시 자동 포맷팅(Auto Fix on Save)" 기능을 활성화하면 더욱 편리합니다._

## 6. 스프린트 및 통합 주기 (Sprint & Integration)

**스프린트(Sprint)** 단위로 개발 및 배포를 진행합니다.

### 통합 주기

- **상시 통합 (Continuous Integration)**:
  - 개별 기능(Feature) 개발이 완료되면 **즉시** PR을 통해 `develop` 브랜치에 병합합니다.
  - _주의: 충돌(Conflict) 방지를 위해 스프린트 마지막 날에 몰아서 병합하지 않습니다._
- **정기 배포 (End of Sprint)**:
  - 스프린트 종료 시점에 `develop` 브랜치의 내용을 `main`으로 병합하여 배포합니다.

### 스프린트 프로세스 (1주 단위 예시)

1. **Sprint Start (월)**: PO가 할당한 백로그 확인 및 작업 시작.
2. **Development (월~목)**: `feat` 브랜치 작업 → `develop`으로 지속적 병합.
3. **Code Freeze (금 오전)**: 새로운 기능 병합 중단, 최종 QA(테스트 코드 통과 및 수동 점검) 및 버그 수정.
4. **Release (금 오후)**: QA 통과 후 `main` 브랜치 병합 및 배포.

> _위 일정은 프로젝트 상황에 따라 유연하게 변경될 수 있습니다._
