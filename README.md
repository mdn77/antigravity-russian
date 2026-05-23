# Antigravity Russian 🇷🇺

> Русификация интерфейса [Antigravity 2.0](https://antigravity.dev) — автоматический перевод на русский язык.

![Платформа](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Версия](https://img.shields.io/badge/version-1.0.0-green)
![Лицензия](https://img.shields.io/badge/license-MIT-brightgreen)

## ✨ Что переводится

- **📋 Навигация** — Settings, Conversations, Projects, Shortcuts и др.
- **⚙️ Настройки** — Agent Settings, Security Preset, Permissions, Models и др.
- **🛡️ Разрешения** — File Access Rules, Network Access Rules, Terminal Commands
- **🔘 Кнопки** — Submit, Cancel, Retry, Save, Delete, Copy и др.
- **💬 Чат** — статусы, поля ввода, управление
- **📊 Статусы** — Running, Idle, Thinking, Loading

Перевод работает динамически через `MutationObserver` — новые элементы переводятся сразу при появлении.

## 🚀 Установка

### Требования
- Установленный [Node.js](https://nodejs.org/) (версия 16+)
- Установленный [Antigravity](https://antigravity.dev) (версия 2.0+)

### Процесс установки
```bash
git clone https://github.com/mdn77/antigravity-russian.git
cd antigravity-russian
node install.js
```

После завершения **перезапустите Antigravity**.

### Удаление
```bash
node install.js --uninstall
```
Восстановит оригинальный `app.asar` из резервной копии.

### Альтернативный способ (без модификации файлов)
Скопируйте код из `russify.js` и вставьте в консоль разработчика Antigravity (`Ctrl+Shift+I` → **Console**). Перевод будет работать до перезапуска.

## 🔧 Совместимость

| Версия Antigravity | Поддержка | Примечание |
|---|---|---|
| 2.0.6+ | ✅ Полная | Инъекция через `executeJavaScript` |
| 2.0.0–2.0.5 | ✅ Полная | Инъекция через `executeJavaScript` |

## 🔗 Совместимость с другими плагинами

Русификация полностью совместима с [Antigravity Auto-Accept](https://github.com/mdn77/antigravity-auto-accept) — можно устанавливать оба плагина одновременно. Порядок установки не имеет значения.

## 📂 Структура проекта

```
antigravity-russian/
├── install.js      — Установщик/деинсталлятор
├── russify.js      — Скрипт русификации интерфейса
├── README.md       — Документация
└── LICENSE         — Лицензия MIT
```

## 🛠️ Как это работает

1. **install.js** распаковывает `app.asar`, копирует `russify.js` в `dist/antig_russify.js` и добавляет загрузчик в `utils.js`
2. При запуске Antigravity загрузчик вызывает `webContents.executeJavaScript()` с кодом русификации
3. **russify.js** создаёт `MutationObserver`, который отслеживает изменения DOM и переводит тексты по словарю
4. Динамический контент (модалки, всплывающие элементы) переводится автоматически при появлении

## 🤝 Добавление переводов

Хотите добавить свои переводы? Отредактируйте объект `translations` в `russify.js`:

```javascript
const translations = {
    'English text': 'Русский текст',
    // Добавьте свои переводы здесь
};
```

## 🛡️ Безопасность

- Перед установкой создаётся **бэкап** файла `app.asar`
- `--uninstall` полностью восстанавливает оригинал
- Скрипт **не отправляет** никаких данных — работает полностью локально

## 📋 Лицензия

Проект распространяется под лицензией [MIT](LICENSE).
