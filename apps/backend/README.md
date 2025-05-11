# BookNote 백엔드

BookNote 애플리케이션의 NestJS 백엔드입니다. 이 백엔드는 계층형 아키텍처를 사용하여 구현되었습니다.

## 기술 스택

- NestJS (Node.js 프레임워크)
- GraphQL (API)
- REST API
- MikroORM (데이터베이스 ORM)
- MySQL (데이터베이스)
- JWT (인증)
- Jest (테스트)

## 계층형 아키텍처

이 프로젝트는 다음 계층들로 구성되어 있습니다:

1. **컨트롤러 계층 (Controllers)**: 클라이언트 요청을 처리하고 응답을 반환합니다.
2. **서비스 계층 (Services)**: 비즈니스 로직과 워크플로우를 관리합니다.
3. **리포지토리 계층 (Repositories)**: 데이터베이스와의 상호작용을 담당합니다.
4. **엔티티 계층 (Entities)**: 데이터베이스 테이블과 매핑되는 객체들을 정의합니다.

## 주요 모듈

- **인증 (Auth)**: 사용자 인증, 등록, 로그인, 토큰 관리
- **도서 (Books)**: 도서 관리
- **노트 (Notes)**: 독서 노트, 인용구, 생각 등 관리
- **읽기 상태 (Reading Status)**: 독서 상태 추적
- **통계 (Statistics)**: 독서 활동 통계
- **사용자 설정 (User Settings)**: 사용자 기본 설정 관리

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 모드로 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 모드로 실행
npm run start:prod
```

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
npm run migration:create

# 마이그레이션 실행
npm run migration:up

# 마이그레이션 롤백
npm run migration:down
```

## 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지 보고서
npm run test:cov
``` 