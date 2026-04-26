# MAVIN Frontend

Фронтенд веб-сервиса предзаказа еды с самовывозом (Click & Collect) и персональным ИИ-ассистентом по питанию.

[![CI](https://github.com/MAVIN-26/MAVIN-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/MAVIN-26/MAVIN-frontend/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Proprietary-red)](./LICENSE)

---

## О проекте

MAVIN позволяет пользователям заранее выбирать блюда в ресторанах и забирать готовый заказ без ожидания. Доставка курьером не предусмотрена — только самовывоз.

Приложение поддерживает три роли:

| Роль | Возможности |
|---|---|
| `customer` | Каталог ресторанов, корзина, заказы, избранное, промокоды, подписка, ИИ-ассистент |
| `restaurant_admin` | Управление меню, просмотр и обработка заказов, профиль ресторана |
| `site_admin` | Управление пользователями, ресторанами, промокодами, справочниками |

---

## Стек технологий

| Технология | Версия | Назначение |
|---|---|---|
| React | 19 | UI-фреймворк |
| TypeScript | 6 | Типизация |
| Vite | 8 | Сборщик |
| React Router | 7 | Маршрутизация |
| Zustand | 5 | Управление состоянием |
| Axios | 1.14 | HTTP-клиент |
| Tailwind CSS | 4 | Стили |
| react-hook-form | — | Формы и валидация |

---

## Структура проекта

```
src/
├── api/          # HTTP-запросы к бэкенду (по Swagger)
├── components/   # Переиспользуемые компоненты
│   ├── admin/    # Компоненты панели администратора сайта
│   └── owner/    # Компоненты панели администратора ресторана
├── hooks/        # Пользовательские хуки
├── layouts/      # Обёртки страниц (MainLayout, AdminLayout, OwnerLayout)
├── pages/        # Страницы приложения
│   ├── admin/    # Страницы панели администратора сайта
│   └── owner/    # Страницы панели администратора ресторана
├── services/     # WebSocket-клиенты
├── store/        # Zustand-сторы (auth, cart, notifications, toast)
├── types/        # TypeScript-типы
└── utils/        # Утилиты
```

---

## Быстрый старт

### Требования

- Node.js ≥ 20
- Запущенный [MAVIN-backend](https://github.com/MAVIN-26/MAVIN-backend)

### Установка и запуск

```bash
git clone https://github.com/MAVIN-26/MAVIN-frontend.git
cd MAVIN-frontend

npm install
npm run dev
```

Приложение будет доступно на `http://localhost:5173`.

Все запросы к `/api/v1` автоматически проксируются на `http://localhost:8000` — переменные окружения не нужны.

---

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера с HMR |
| `npm run build` | Сборка для продакшена |
| `npm run lint` | Проверка кода ESLint |
| `npm run preview` | Предпросмотр собранного приложения |

---

## Связанные репозитории

| Репозиторий | Описание                                         |
|---|--------------------------------------------------|
| [MAVIN](https://github.com/MAVIN-26/MAVIN) | Документация, аналитика, дизайн |
| [MAVIN-backend](https://github.com/MAVIN-26/MAVIN-backend) | FastAPI-бэкенд                                   |

---

## Дизайн

Макеты интерфейса (PNG, SVG) находятся в папке [`design/`](https://github.com/MAVIN-26/MAVIN/tree/main/design) репозитория MAVIN.

Figma: https://www.figma.com/design/EdTWgg9UkCrqUpKciIxGuJ/MAVIN

---

## Git Workflow

- Основная ветка разработки: `develop`
- Ветки: `feature/<описание>`, `fix/<описание>`, `hotfix/<описание>`
- Каждая задача — отдельная ветка, несколько коммитов, merge в `develop`

**Пример ветки:** `feature/fe-2-1-order-page`

**Стиль коммитов** ([Conventional Commits](https://www.conventionalcommits.org/)):

```
feat: add order page
feat: connect API
fix: validation bug
refactor: simplify component
```

---

## Команда

| Участник | Роль                   | Зона ответственности                                    |
|---|------------------------|---------------------------------------------------------|
| Дегальцева Алина | Team Lead, Разработчик | Фронтенд (React), бэкенд (Python), деплой, CI/CD        |
| Юрьева Мария | Дизайнер               | UX/UI дизайн, дизайн-система            |
| Гиричев Виктор | Проджект-менеджер      | Планирование, управление задачами, коммуникация в команде |
| Баженов Никита | Аналитик               | Сбор требований, постановка задач, бизнес-логика        |
| Червоный Иван | Тестировщик            | Тестирование, баг-репорты, контроль качества            |

---

## Лицензия

Copyright © 2026 Команда MAVIN. Все права защищены.  
Использование, копирование и распространение без письменного разрешения авторов запрещено.
