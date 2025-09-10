# 🚀 ClashRoyale.Web - Инструкция по установке

## ❗ Требования

Перед запуском проекта необходимо установить следующие компоненты:

### 1. Node.js 18+
Скачайте и установите Node.js с официального сайта:
- **Скачать**: https://nodejs.org/
- **Версия**: 18.x или выше
- **Проверка**: `node --version` и `npm --version`

### 2. Docker Desktop
Скачайте и установите Docker Desktop:
- **Скачать**: https://www.docker.com/products/docker-desktop/
- **Проверка**: `docker --version` и `docker-compose --version`

### 3. Git (опционально)
Для клонирования репозитория:
- **Скачать**: https://git-scm.com/
- **Проверка**: `git --version`

## 🛠️ Установка проекта

### Шаг 1: Установка зависимостей

После установки Node.js и Docker, выполните:

```powershell
# 1. Установите зависимости для всех сервисов
cd services\auth-service
npm install

cd ..\user-service
npm install

cd ..\deck-service
npm install

cd ..\matchmaking-service
npm install

cd ..\game-service
npm install

cd ..\notification-service
npm install

cd ..\..\frontend
npm install
```

### Шаг 2: Запуск инфраструктуры

```powershell
# Запустите PostgreSQL и Redis
docker-compose -f docker-compose.dev.yml up -d

# Проверьте, что сервисы запущены
docker-compose -f docker-compose.dev.yml ps
```

### Шаг 3: Запуск сервисов

Откройте **7 отдельных терминалов** и выполните в каждом:

**Терминал 1 - Auth Service:**
```powershell
cd services\auth-service
npm run dev
```

**Терминал 2 - User Service:**
```powershell
cd services\user-service
npm run dev
```

**Терминал 3 - Deck Service:**
```powershell
cd services\deck-service
npm run dev
```

**Терминал 4 - Matchmaking Service:**
```powershell
cd services\matchmaking-service
npm run dev
```

**Терминал 5 - Game Service:**
```powershell
cd services\game-service
npm run dev
```

**Терминал 6 - Notification Service:**
```powershell
cd services\notification-service
npm run dev
```

**Терминал 7 - Frontend:**
```powershell
cd frontend
npm run dev
```

## 🌐 Доступ к приложению

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:80
- **Health Check**: http://localhost/health

## 🔧 Решение проблем

### Проблема: "node не является внутренней или внешней командой"
**Решение**: Установите Node.js и перезапустите терминал

### Проблема: "docker не является внутренней или внешней командой"
**Решение**: Установите Docker Desktop и перезапустите терминал

### Проблема: "EADDRINUSE" (порт занят)
**Решение**: 
```powershell
# Найдите процесс, использующий порт
netstat -ano | findstr :3001

# Завершите процесс (замените PID)
taskkill /PID <PID> /F
```

### Проблема: "ECONNREFUSED" (не удается подключиться к БД)
**Решение**: Убедитесь, что PostgreSQL и Redis запущены:
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 Проверка статуса

### Проверка сервисов
```powershell
# Статус Docker контейнеров
docker-compose -f docker-compose.dev.yml ps

# Логи сервисов
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis
```

### Проверка API
```powershell
# Health check
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3006/health
```

## 🎮 Тестирование игры

1. Откройте http://localhost:3000
2. Зарегистрируйте нового пользователя
3. Создайте колоду из 8 карт
4. Начните поиск матча
5. Играйте против другого игрока!

## 🆘 Поддержка

Если у вас возникли проблемы:

1. **Проверьте логи сервисов** в папках `services/*/logs/`
2. **Убедитесь, что все порты свободны** (3001-3006, 80, 3000)
3. **Проверьте, что Docker запущен**
4. **Перезапустите все сервисы** в правильном порядке

---

**Удачной игры! 🎮⚔️**
