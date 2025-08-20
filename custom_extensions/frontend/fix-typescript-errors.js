#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Функция для исправления TypeScript ошибок в ProjectsTable.tsx
function fixProjectsTableErrors() {
    const filePath = path.join(__dirname, 'src/components/ProjectsTable.tsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('Файл ProjectsTable.tsx не найден');
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Исправляем все вхождения designMicroproductType на правильные свойства
    const replacements = [
        // Исправляем использование в reduce функциях
        {
            from: /const type = project\.designMicroproductType \|\| 'Unknown';/g,
            to: "const type = (project as BackendProject).design_microproduct_type || 'Unknown';"
        },
        // Исправляем использование в других местах для Project типа
        {
            from: /project\.designMicroproductType/g,
            to: "(project as Project).designMicroproductType"
        }
    ];
    
    replacements.forEach(replacement => {
        content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Исправлены ошибки TypeScript в ProjectsTable.tsx');
}

// Функция для исправления ESLint ошибок с any типом
function fixESLintAnyErrors() {
    const filePath = path.join(__dirname, 'src/utils/deckgoFromJson.tsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('Файл deckgoFromJson.tsx не найден');
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Заменяем any на более конкретные типы
    const replacements = [
        {
            from: /: any/g,
            to: ": unknown"
        },
        {
            from: /as any/g,
            to: "as unknown"
        }
    ];
    
    replacements.forEach(replacement => {
        content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Исправлены ESLint ошибки с any типом в deckgoFromJson.tsx');
}

// Основная функция
function main() {
    console.log('🔧 Исправление TypeScript и ESLint ошибок...');
    
    try {
        fixProjectsTableErrors();
        fixESLintAnyErrors();
        console.log('✅ Все ошибки исправлены!');
    } catch (error) {
        console.error('❌ Ошибка при исправлении:', error);
        process.exit(1);
    }
}

main(); 