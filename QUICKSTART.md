# 🚀 ClashRoyale.Web - Быстрый старт

## 🎯 Запуск одной командой!

### 1. Установите требования (один раз)
- **Node.js**: https://nodejs.org/ (скачайте LTS версию)
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/

### 2. Запустите игру (без Docker)

**Если автоматический запуск не получается, попробуйте:**

```batch
# Сначала установите зависимости:
install-deps.bat

# Затем запустите простую версию (без Docker):
play-simple.bat
```

**Или отладочную версию (без Docker):**
```batch
# Для отладки проблем:
play-debug.bat
```

**Оригинальная версия:**
```batch
# Полная версия с установкой:
play.bat
```

### 3. Играйте!
- Игра откроется автоматически в браузере
- URL: http://localhost:3000
- Все сервисы запустятся автоматически

## 🛑 Остановка игры

```batch
# Двойной клик на файл:
stop.bat
```

**Или через командную строку:**
```cmd
stop.bat
```

## 🎮 Что происходит автоматически (без Docker)?

1. ✅ Проверка Node.js и Docker
2. ✅ Проверка окружения (PostgreSQL + Redis должны быть установлены локально)
3. ✅ Установка зависимостей
4. ✅ Запуск 3 процессов: Game Service, Notification Service, Frontend
5. ✅ Открытие игры в браузере

## 🔧 Если что-то не работает

1. **Убедитесь, что установлены Node.js и Docker**
2. **Перезапустите терминал после установки**
3. **Проверьте, что порты 3000, 3005, 3006 свободны**
4. **Запустите `stop.bat` и попробуйте снова**

## 📊 Сервисы

- **Frontend**: http://localhost:3000 (игра)
- **Auth Service**: http://localhost:3001/health
- **User Service**: http://localhost:3002/health
- **Deck Service**: http://localhost:3003/health
- **Matchmaking Service**: http://localhost:3004/health
- **Game Service**: http://localhost:3005/health
- **Notification Service**: http://localhost:3006/health

## 🎯 Готово!

Теперь вы можете играть в ClashRoyale.Web! 🎮⚔️
