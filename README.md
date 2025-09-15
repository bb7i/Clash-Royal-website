# ClashRoyale.Web

Веб-версия стратегической PvP-игры в реальном времени в стиле Clash Royale.

## 🚀 Быстрый старт (одна команда!)

```batch
# Просто запустите:
play.bat
```

> 📖 **Подробная инструкция**: [QUICKSTART.md](QUICKSTART.md)

## Архитектура

Проект использует микросервисную архитектуру:

- **API Gateway** (Nginx) - единая точка входа
- **Auth Service** - аутентификация и JWT токены
- **User Service** - данные пользователей и профили
- **Deck Service** - управление колодами и коллекциями карт
- **Matchmaking Service** - поиск противников
- **Game Service** - игровая логика и сессии
- **Notification Service** - WebSocket уведомления

## Технологический стек

### Backend
- Node.js + Express
- Socket.IO для WebSocket соединений
- PostgreSQL для основной БД
- Redis для кэширования и очередей

### Frontend
- React + Redux Toolkit
- PixiJS для 2D графики
- Socket.IO Client

### Инфраструктура
- Docker + Docker Compose
- Nginx как API Gateway

## Быстрый старт

### Для разработки (без Docker)

1. **Установите PostgreSQL и Redis локально:**
- PostgreSQL 14+ (пользователь: `clashroyale`, пароль: `clashroyale123`, БД: `clashroyale`)
- Redis 6+ (по умолчанию `redis://localhost:6379`)

2. **Установка зависимостей:**
```bash
# Корневой сервис (Game Service)
npm install

# Notification Service
cd notification-service && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

3. **Запуск сервисов:**
```bash
# Терминал 1 - Game Service (корень)
npm run dev

# Терминал 2 - Notification Service
cd notification-service && npm run dev

# Терминал 3 - Frontend
cd frontend && npm run dev
```

4. **Доступ к приложению:**
- Frontend: http://localhost:3000
- Game Service (health): http://localhost:3005/health
- Notification Service (health): http://localhost:3006/health

### Продакшен
Без Docker: разверните PostgreSQL/Redis и запустите те же сервисы, настроив переменные окружения (`.env`).

## Структура проекта

```
├── services/
│   ├── auth-service/          # Сервис аутентификации
│   ├── user-service/          # Сервис пользователей
│   ├── deck-service/          # Сервис колод
│   ├── matchmaking-service/   # Сервис поиска матчей
│   ├── game-service/          # Игровая логика
│   └── notification-service/  # WebSocket уведомления
├── frontend/                  # React приложение
├── api-gateway/              # Nginx конфигурация
├── database/                 # SQL скрипты и миграции
├── docker-compose.yml        # Продакшен конфигурация
├── docker-compose.dev.yml    # Разработка конфигурация
└── README.md
```

## API Endpoints

### Auth Service
- `POST /auth/register` - регистрация
- `POST /auth/login` - авторизация
- `POST /auth/refresh` - обновление токена
- `POST /auth/logout` - выход

### User Service
- `GET /users/profile` - профиль пользователя
- `PUT /users/profile` - обновление профиля

### Deck Service
- `GET /decks` - список колод пользователя
- `POST /decks` - создание колоды
- `PUT /decks/:id` - обновление колоды
- `DELETE /decks/:id` - удаление колоды

### Matchmaking Service
- `POST /matchmaking/search` - поиск матча
- `DELETE /matchmaking/search` - отмена поиска

### Game Service
- `GET /game/status/:matchId` - статус игры
- `POST /game/action` - игровое действие

## Разработка

### Требования
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Установка зависимостей

```bash
# Backend сервисы
cd services/auth-service && npm install
cd services/user-service && npm install
# ... и так далее для каждого сервиса

# Frontend
cd frontend && npm install
```

### Запуск в режиме разработки

```bash
# Запуск только инфраструктуры (БД, Redis)
docker-compose -f docker-compose.dev.yml up postgres redis

# Запуск сервисов локально
npm run dev:auth
npm run dev:user
# ... и так далее
```

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов конкретного сервиса
cd services/auth-service && npm test
```

## Деплой

```bash
# Продакшен сборка
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 🎮 Игровые функции

### Основной геймплей
- **PvP бои в реальном времени** - сражения 1 на 1 с другими игроками
- **Система эликсира** - автоматическое пополнение каждые 2 секунды
- **Колоды из 8 карт** - создание и управление боевыми колодами
- **Типы карт**: троопы, здания, заклинания
- **Редкость карт**: обычные, редкие, эпические, легендарные

### Игровая механика
- **3-минутные бои** с возможностью "внезапной смерти"
- **Уничтожение башен** - Королевская башня и башни принцесс
- **Система трофеев** - рейтинговая система с наградами
- **Улучшение карт** - повышение уровня за золото и дубликаты

### Социальные функции
- **Лидерборд** - рейтинг лучших игроков
- **Система уведомлений** - WebSocket уведомления в реальном времени
- **Эмоции в игре** - отправка смайликов противнику

## 🛠️ Разработка

### Требования
- **Node.js 18+** - [Скачать](https://nodejs.org/)
- **Docker Desktop** - [Скачать](https://www.docker.com/products/docker-desktop/)
- **Git** (опционально) - [Скачать](https://git-scm.com/)

> ⚠️ **Важно**: Убедитесь, что Node.js и Docker установлены и добавлены в PATH перед запуском проекта!

### 🚀 Супер быстрый старт (одна команда!)

**Просто запустите:**
```batch
# Windows - двойной клик или в командной строке
play.bat
```

**Или через PowerShell:**
```powershell
.\start.ps1
```

**Или через командную строку:**
```cmd
start.bat
```

> 🎯 **Это все!** Скрипт автоматически:
> - Проверит требования
> - Установит зависимости
> - Запустит все сервисы
> - Откроет игру в браузере

### 📋 Требования (устанавливаются автоматически)

- **Node.js 18+** - [Скачать](https://nodejs.org/)
- **Docker Desktop** - [Скачать](https://www.docker.com/products/docker-desktop/)

> ⚠️ **Важно**: Установите Node.js и Docker, затем запустите `play.bat`!

3. **Запустите сервисы в отдельных терминалах:**
```bash
# Terminal 1 - Auth Service
cd services/auth-service && npm run dev

# Terminal 2 - User Service  
cd services/user-service && npm run dev

# Terminal 3 - Deck Service
cd services/deck-service && npm run dev

# Terminal 4 - Matchmaking Service
cd services/matchmaking-service && npm run dev

# Terminal 5 - Game Service
cd services/game-service && npm run dev

# Terminal 6 - Notification Service
cd services/notification-service && npm run dev

# Terminal 7 - Frontend
cd frontend && npm run dev
```

4. **Откройте приложение:**
- Frontend: http://localhost:3000
- API: http://localhost:80

### Тестирование

```bash
# Запуск всех тестов
npm test

# Тестирование конкретного сервиса
cd services/auth-service && npm test
```

### API Документация

#### Auth Service
- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Авторизация
- `POST /auth/refresh` - Обновление токена
- `POST /auth/logout` - Выход

#### User Service
- `GET /users/profile` - Получить профиль
- `PUT /users/profile` - Обновить профиль
- `POST /users/avatar` - Загрузить аватар
- `GET /users/leaderboard` - Получить лидерборд

#### Deck Service
- `GET /decks` - Получить колоды пользователя
- `POST /decks` - Создать колоду
- `PUT /decks/:id` - Обновить колоду
- `DELETE /decks/:id` - Удалить колоду
- `GET /cards` - Получить все карты
- `GET /cards/user` - Получить карты пользователя

#### Matchmaking Service
- `POST /matchmaking/search` - Начать поиск матча
- `DELETE /matchmaking/search` - Отменить поиск
- `GET /matchmaking/status` - Статус поиска

#### Game Service
- `GET /game/status/:matchId` - Статус игры
- `GET /game/history` - История игр

### WebSocket События

#### Matchmaking
- `join-queue` - Присоединиться к очереди
- `leave-queue` - Покинуть очередь
- `match-found` - Найден противник

#### Game
- `join-game` - Присоединиться к игре
- `game-action` - Игровое действие
- `game-update` - Обновление состояния игры
- `game-ended` - Игра завершена

#### Notifications
- `authenticate` - Аутентификация WebSocket
- `join-room` - Присоединиться к комнате
- `notification` - Получить уведомление

## 🚀 Деплой

### Продакшен

```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### Мониторинг

```bash
# Статус сервисов
curl http://localhost/health

# Логи конкретного сервиса
docker-compose logs -f auth-service
```

## 📊 Архитектура

### Микросервисы
- **Auth Service** (3001) - Аутентификация и авторизация
- **User Service** (3002) - Управление пользователями
- **Deck Service** (3003) - Управление колодами и картами
- **Matchmaking Service** (3004) - Поиск противников
- **Game Service** (3005) - Игровая логика
- **Notification Service** (3006) - WebSocket уведомления

### Инфраструктура
- **PostgreSQL** (5432) - Основная база данных
- **Redis** (6379) - Кэширование и очереди
- **Nginx** (80) - API Gateway и балансировщик
- **Frontend** (3000) - React приложение

### База данных

Основные таблицы:
- `users` - Пользователи
- `cards` - Карты игры
- `user_cards` - Карты пользователей
- `decks` - Колоды
- `deck_cards` - Карты в колодах
- `matches` - Матчи
- `game_actions` - Игровые действия
- `refresh_tokens` - Токены обновления

## 🔧 Конфигурация

### Переменные окружения

Каждый сервис использует следующие переменные:
- `NODE_ENV` - Окружение (development/production)
- `PORT` - Порт сервиса
- `DATABASE_URL` - URL базы данных
- `REDIS_URL` - URL Redis
- `JWT_SECRET` - Секретный ключ JWT
- `FRONTEND_URL` - URL фронтенда

### Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Rate limiting для API
- CORS настройки
- Валидация всех входящих данных

## 📈 Производительность

### Оптимизации
- Redis для кэширования
- Connection pooling для PostgreSQL
- Сжатие gzip
- Оптимизированные SQL запросы
- WebSocket для реального времени

### Масштабирование
- Горизонтальное масштабирование сервисов
- Load balancing через Nginx
- Отдельные инстансы Game Service для каждого матча
- Redis кластер для высокой доступности

## 🐛 Отладка

### Логи
```bash
# Просмотр логов всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs auth-service

# Следить за логами в реальном времени
docker-compose logs -f game-service
```

### База данных
```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U clashroyale -d clashroyale

# Подключение к Redis
docker-compose exec redis redis-cli
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Frontend**: React, TypeScript, PixiJS, Redux Toolkit
- **DevOps**: Docker, Docker Compose, Nginx
- **Architecture**: Microservices, WebSocket, JWT

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте [Issues](https://github.com/your-repo/issues)
2. Создайте новый Issue с подробным описанием
3. Приложите логи и скриншоты если возможно

---

**ClashRoyale.Web** - Веб-версия популярной мобильной игры Clash Royale с полным функционалом PvP боев в реальном времени! 🎮⚔️
