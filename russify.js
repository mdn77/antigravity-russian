// antig_russify.js — Русификация интерфейса Antigravity 2.0.6
// Заменяет англоязычные тексты интерфейса на русские
// Работает через MutationObserver для динамического контента
(function() {
    'use strict';
    
    // Словарь переводов: английский → русский
    const translations = {
        // Главное меню/навигация
        'Settings': 'Настройки',
        'New Conversation': 'Новый разговор',
        'Conversation History': 'История разговоров',
        'Conversations': 'Разговоры',
        'Projects': 'Проекты',
        'Shortcuts': 'Горячие клавиши',
        'Provide Feedback': 'Обратная связь',
        'Show all': 'Показать все',
        'Not in Project': 'Вне проекта',
        
        // Настройки — заголовки разделов
        'General': 'Общие',
        'Account': 'Аккаунт',
        'Permissions': 'Разрешения',
        'Appearance': 'Оформление',
        'Models': 'Модели',
        'Customizations': 'Настройки ИИ',
        'Browser': 'Браузер',
        'App': 'Приложение',
        
        // Настройки — Agent Settings
        'Agent Settings': 'Настройки агента',
        'Agent settings and permissions for conversations outside of projects.': 
            'Настройки агента и разрешения для разговоров вне проектов.',
        'Security Preset': 'Профиль безопасности',
        'Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.':
            'Выберите профиль безопасности для агента. Это определяет политику авто-исполнения команд и доступа к файлам.',
        'Custom': 'Пользовательский',
        'Outside of folders file access policy': 'Политика доступа к файлам вне папок',
        'Configures how the agent tries to access files outside of its working folders.':
            'Определяет, как агент работает с файлами за пределами рабочих папок.',
        'Always Ask': 'Всегда спрашивать',
        'Terminal Command Auto Execution': 'Авто-исполнение команд терминала',
        'Controls whether terminal commands require your approval before running.':
            'Управляет необходимостью подтверждения перед запуском команд в терминале.',
        'Always Proceed': 'Всегда выполнять',
        
        // Agent Behavior
        'Agent Behavior': 'Поведение агента',
        'Artifact Review Policy': 'Политика проверки артефактов',
        "Specifies Agent's behavior on asking for review on artifacts, which are documents it creates to enable a richer conversation experience.":
            'Определяет поведение агента при запросе проверки артефактов — документов, создаваемых для улучшения взаимодействия.',
        
        // Local Permissions
        'Local Permissions': 'Локальные разрешения',
        'Inherits from': 'Наследует из',
        'global settings': 'глобальных настроек',
        'Local permissions have higher priority.': 'Локальные разрешения имеют приоритет.',
        'Learn more.': 'Подробнее.',
        'File Access Rules': 'Правила доступа к файлам',
        'Configure allowed and denied paths for file reads and writes.':
            'Настройте разрешённые и запрещённые пути для чтения и записи файлов.',
        'Network Access Rules': 'Правила доступа к сети',
        'Configure allowed and denied URLs for reading.':
            'Настройте разрешённые и запрещённые URL для чтения.',
        'Terminal Commands': 'Команды терминала',
        'Configure allowed terminal commands.':
            'Настройте разрешённые команды терминала.',
        'Open': 'Открыть',
        
        // Кнопки и действия
        'Submit': 'Отправить',
        'Cancel': 'Отмена',
        'Retry': 'Повторить',
        'Try again': 'Попробовать снова',
        'Close': 'Закрыть',
        'Save': 'Сохранить',
        'Delete': 'Удалить',
        'Copy': 'Копировать',
        'Edit': 'Изменить',
        
        // Статусы
        'Running': 'Работает',
        'Idle': 'Простаивает',
        'Thinking': 'Думает',
        'Loading': 'Загрузка',
        
        // Чат
        'Type a message...': 'Введите сообщение...',
        'Send': 'Отправить',
        'Stop': 'Остановить',
        'New chat': 'Новый чат',
        
        // Версия
        'Version': 'Версия',
        'Check for Updates': 'Проверить обновления',
    };

    // Карта точных совпадений textContent (для кнопок/ссылок)
    const exactMap = new Map(Object.entries(translations));

    // Функция перевода текстового узла
    function translateTextNode(node) {
        if (!node.textContent) return;
        const text = node.textContent.trim();
        if (exactMap.has(text)) {
            node.textContent = node.textContent.replace(text, exactMap.get(text));
        }
    }

    // Функция перевода элемента и его потомков
    function translateElement(el) {
        // Пропускаем скрипты и стили
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEXTAREA') return;
        
        // Переводим placeholder
        if (el.placeholder && exactMap.has(el.placeholder.trim())) {
            el.placeholder = exactMap.get(el.placeholder.trim());
        }
        
        // Переводим title/tooltip
        if (el.title && exactMap.has(el.title.trim())) {
            el.title = exactMap.get(el.title.trim());
        }

        // Переводим текстовые узлы
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let textNode;
        while (textNode = walker.nextNode()) {
            const text = textNode.textContent.trim();
            if (text && exactMap.has(text)) {
                textNode.textContent = textNode.textContent.replace(text, exactMap.get(text));
            }
        }
    }

    // Первоначальный перевод страницы
    function translatePage() {
        translateElement(document.body);
    }

    // MutationObserver для динамического контента
    function startObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Новые узлы
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        translateElement(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        translateTextNode(node);
                    }
                }
                // Изменённый текст
                if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                    translateTextNode(mutation.target);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return observer;
    }

    // Инициализация
    function init() {
        if (!document.body) {
            setTimeout(init, 500);
            return;
        }
        
        // Первый проход перевода
        translatePage();
        
        // Повторяем через секунду (для контента, который загружается после)
        setTimeout(translatePage, 1000);
        setTimeout(translatePage, 3000);
        
        // Запускаем наблюдатель за изменениями
        startObserver();
        
        console.log('[RU] Русификация интерфейса активирована');
    }

    init();

    // Регистрация для возможного удаления
    window.__ANTIG_RUSSIFY = { version: '1.0.0' };
})();
