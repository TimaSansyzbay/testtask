# AI Chat — Тестовое задание

Полноценный чат-ассистент на базе Google Gemini с поддержкой голосового режима «руки свободны».

## Стек технологий

**Frontend**
- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Ant Design 6
- Zustand (управление состоянием)
- Браузерные API: `SpeechRecognition`, `SpeechSynthesis`, `AudioContext`

**Backend**
- Node.js + Express 5 + TypeScript
- Google Gemini API (`@google/generative-ai`)
- SSE (Server-Sent Events) для потоковой передачи ответов
- Zod — валидация окружения и запросов

## Возможности

- 💬 **Потоковый чат** — ответы ИИ отображаются по мере генерации
- 🎤 **Голосовой режим** — руки свободны, полный цикл: речь → текст → ИИ → озвучка
- 🔊 **Автоматическое прерывание** — начните говорить, и ИИ замолчит сам
- 🧠 **Краткие голосовые ответы** — отдельный системный промпт для голосового режима
- 📋 **Markdown и подсветка кода** — рендеринг ответов с форматированием
- 🔄 **Повтор и регенерация** — возможность повторить или обновить ответ
- 💾 **Сохранение истории** — чат сохраняется в `localStorage`

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/TimaSansyzbay/testtask.git
cd testtask
```

### 2. Настроить бэкенд

```bash
cd backend
cp .env.example .env
```

Открыть `backend/.env` и вставить ключ API:

```
GEMINI_API_KEY=ваш_ключ_здесь
```

Получить бесплатный ключ: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

```bash
npm install
npm run dev
```

Бэкенд запустится на `http://localhost:3001`.

### 3. Запустить фронтенд

```bash
cd ../frontend
npm install
npm run dev
```

Открыть [http://localhost:5173](http://localhost:5173).

> В dev-режиме Vite автоматически проксирует `/api` → `localhost:3001`, поэтому `VITE_API_URL` оставьте пустым.

## Переменные окружения

### backend/.env

| Переменная | Описание | Обязательно |
|---|---|---|
| `GEMINI_API_KEY` | Ключ Google Gemini | ✅ |
| `GEMINI_MODEL` | Модель (по умолчанию `gemini-2.5-flash-lite`) | — |
| `CLIENT_URL` | URL фронтенда (для CORS) | ✅ |
| `NODE_ENV` | `development` / `production` | — |
| `PORT` | Порт сервера (по умолчанию `3001`) | — |

### frontend/.env.local

| Переменная | Описание |
|---|---|
| `VITE_API_URL` | URL бэкенда (оставьте пустым для dev-режима) |

## Деплой на Vercel

### Бэкенд

1. Новый проект → корневая директория: `backend`
2. Framework: **Other**
3. Добавить переменные окружения: `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLIENT_URL`, `NODE_ENV=production`

### Фронтенд

1. Новый проект → корневая директория: `frontend`
2. Framework: **Vite**
3. Добавить переменную окружения: `VITE_API_URL=https://ваш-бэкенд.vercel.app`

## Структура проекта

```
├── backend/
│   ├── api/index.ts          # Точка входа для Vercel
│   ├── src/
│   │   ├── app.ts            # Express приложение
│   │   ├── config/           # env, Gemini клиент
│   │   ├── controllers/      # Обработчики запросов
│   │   ├── middleware/        # CORS, rate-limit, ошибки
│   │   ├── routes/           # Маршруты API
│   │   ├── services/         # Интеграция с Gemini
│   │   ├── types/            # TypeScript типы
│   │   └── validators/       # Zod схемы
│   └── vercel.json
│
└── frontend/
    ├── src/
    │   ├── components/chat/  # UI компоненты чата
    │   ├── hooks/            # useChat, useVoiceAssistant, useSpeechRecognition и др.
    │   ├── services/         # HTTP клиент (SSE)
    │   ├── store/            # Zustand хранилище
    │   ├── styles/           # Глобальные стили
    │   └── utils/            # Утилиты
    └── vercel.json
```
