const fs = require('fs');
const path = require('path');

// Possibles rutes on pot estar l'Admin (per assegurar el tret)
const possiblePaths = [
    'frontend/src/pages/Admin.jsx',
    'frontend/src/components/Admin.jsx'
];

// Correccions específiques per a la pantalla d'Admin
const adminFixes = [
    { find: /AdministraciÃ³/g, replace: 'Administració' },
    { find: /GestiÃ³/g, replace: 'Gestió' },
    { find: /AccÃ©s/g, replace: 'Accés' },
    { find: /Usuaris/g, replace: 'Usuaris' }, // A vegades el títol es trenca
    { find: /ConfiguraciÃ³/g, replace: 'Configuració' }
];

console.log('🔧 Reparant Panell d\'Administració...');

possiblePaths.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        adminFixes.forEach(fix => {
            content = content.replace(fix.find, fix.replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Títols corregits a: ${filePath}`);
        } else {
            console.log(`ℹ️  El fitxer ${filePath} ja estava bé o no tenia errors.`);
        }
    }
});
