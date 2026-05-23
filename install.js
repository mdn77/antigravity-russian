/**
 * install.js — Установщик русификации Antigravity 2.0
 * 
 * Внедряет скрипт русификации интерфейса в app.asar.
 * Перевод работает через MutationObserver — динамически заменяет
 * англоязычные тексты на русские во всём интерфейсе.
 * 
 * Использование:
 *   node install.js              - Установить русификацию
 *   node install.js --uninstall  - Удалить русификацию (восстановить из бэкапа)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Поиск папки установки Antigravity в зависимости от ОС
function findAntigravityPath() {
    const platform = process.platform;
    const possiblePaths = [];

    if (platform === 'win32') {
        possiblePaths.push(
            path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity', 'resources'),
            path.join('C:', 'Program Files', 'Antigravity', 'resources'),
            path.join('C:', 'Program Files (x86)', 'Antigravity', 'resources')
        );
    } else if (platform === 'darwin') {
        possiblePaths.push(
            '/Applications/Antigravity.app/Contents/Resources'
        );
    } else {
        possiblePaths.push(
            '/opt/Antigravity/resources',
            '/usr/lib/antigravity/resources',
            path.join(process.env.HOME || '', '.local', 'share', 'antigravity', 'resources')
        );
    }

    for (const p of possiblePaths) {
        const asarPath = path.join(p, 'app.asar');
        if (fs.existsSync(asarPath)) {
            return p;
        }
    }
    return null;
}

// Установка русификации
function install() {
    console.log('=== Установщик русификации Antigravity ===\n');

    const resourcesDir = findAntigravityPath();
    if (!resourcesDir) {
        console.error('ОШИБКА: Путь установки Antigravity не найден!');
        console.log('Убедитесь, что приложение Antigravity установлено.');
        process.exit(1);
    }

    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.backup');
    const extractDir = path.join(resourcesDir, '_asar_temp');

    console.log('Путь Antigravity:', resourcesDir);
    console.log('');

    // Шаг 1: Создание резервной копии
    if (!fs.existsSync(backupPath)) {
        console.log('[1/4] Создание резервной копии app.asar...');
        fs.copyFileSync(asarPath, backupPath);
        console.log('  Резервная копия сохранена:', backupPath);
    } else {
        console.log('[1/4] Резервная копия уже существует, шаг пропущен.');
    }

    // Шаг 2: Извлечение asar архива
    console.log('[2/4] Распаковка app.asar...');
    try {
        execSync(`npx -y @electron/asar extract "${asarPath}" "${extractDir}"`, { stdio: 'pipe' });
    } catch (e) {
        console.error('ОШИБКА: Не удалось извлечь архив asar. Убедитесь, что Node.js установлен.');
        process.exit(1);
    }

    // Шаг 3: Запись скрипта русификации и внедрение загрузчика
    console.log('[3/4] Внедрение русификации...');
    const russifySrc = path.join(__dirname, 'russify.js');
    const russifyDst = path.join(extractDir, 'dist', 'antig_russify.js');
    fs.copyFileSync(russifySrc, russifyDst);

    // Внедрение загрузчика в utils.js через executeJavaScript
    // utils.js — main-процесс Electron, window/document недоступны.
    // Правильный метод: executeJavaScript в обработчике did-finish-load.
    const utilsPath = path.join(extractDir, 'dist', 'utils.js');
    if (fs.existsSync(utilsPath)) {
        let utilsContent = fs.readFileSync(utilsPath, 'utf8');
        if (!utilsContent.includes('antig_russify')) {
            // Ищем обработчик did-finish-load (AntiG виджет или стандартный)
            const didFinishMarker = "win.webContents.on('did-finish-load'";
            const markerPos = utilsContent.indexOf(didFinishMarker);
            
            // Код инъекции через executeJavaScript (работает с contextIsolation: true)
            const injectionCode = `
    // --- Русификация интерфейса Antigravity ---
    win.webContents.on('did-finish-load', () => {
        try {
            const ruPath = require('path').join(__dirname, 'antig_russify.js');
            if (require('fs').existsSync(ruPath)) {
                const ruCode = require('fs').readFileSync(ruPath, 'utf8');
                win.webContents.executeJavaScript(ruCode).catch(() => {});
                console.log('[RU] Русификация внедрена через executeJavaScript');
            }
        } catch(e) { console.error('[RU] Ошибка загрузки русификации:', e); }
    });
    // --- Конец загрузчика русификации ---
`;

            if (markerPos !== -1) {
                // Вставляем ДО существующего did-finish-load
                utilsContent = utilsContent.slice(0, markerPos) + injectionCode + utilsContent.slice(markerPos);
            } else {
                // Fallback: ищем void win.loadURL(url) и вставляем после
                const loadUrlMarker = 'void win.loadURL(url)';
                const loadPos = utilsContent.indexOf(loadUrlMarker);
                if (loadPos !== -1) {
                    const insertPos = utilsContent.indexOf(';', loadPos) + 1;
                    utilsContent = utilsContent.slice(0, insertPos) + '\n' + injectionCode + utilsContent.slice(insertPos);
                } else {
                    // Крайний fallback
                    utilsContent += injectionCode;
                    console.log('  ВНИМАНИЕ: не найден did-finish-load, код добавлен в конец файла');
                }
            }
            fs.writeFileSync(utilsPath, utilsContent, 'utf8');
            console.log('  Загрузчик русификации интегрирован в utils.js (метод: executeJavaScript)');
        } else {
            console.log('  Загрузчик русификации уже присутствует в utils.js');
        }
    }

    // Шаг 4: Сборка asar архива обратно
    console.log('[4/4] Сборка app.asar...');
    try {
        execSync(`npx -y @electron/asar pack "${extractDir}" "${asarPath}"`, { stdio: 'pipe' });
    } catch (e) {
        console.error('ОШИБКА: Не удалось собрать asar архив.');
        process.exit(1);
    }

    // Удаление временной директории
    fs.rmSync(extractDir, { recursive: true, force: true });

    console.log('\n=== Русификация успешно установлена! ===');
    console.log('Перезапустите Antigravity для активации.');
    console.log('Интерфейс будет переведён на русский язык.\n');
}

// Удаление русификации
function uninstall() {
    console.log('=== Удаление русификации Antigravity ===\n');

    const resourcesDir = findAntigravityPath();
    if (!resourcesDir) {
        console.error('ОШИБКА: Путь установки Antigravity не найден!');
        process.exit(1);
    }

    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.backup');

    if (fs.existsSync(backupPath)) {
        console.log('Восстановление оригинального app.asar из бэкапа...');
        fs.copyFileSync(backupPath, asarPath);
        console.log('Русификация удалена! Перезапустите Antigravity.\n');
    } else {
        console.error('ОШИБКА: Файл резервной копии не найден.');
        process.exit(1);
    }
}

if (process.argv.includes('--uninstall')) {
    uninstall();
} else {
    install();
}
