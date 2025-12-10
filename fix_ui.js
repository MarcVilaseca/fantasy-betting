const fs = require('fs');
const path = require('path');

// Llista de fitxers afectats
const files = [
    'frontend/src/components/Navbar.jsx',
    'frontend/src/components/BetSlip.jsx',
    'frontend/src/pages/Leaderboard.jsx',
    'frontend/src/pages/Admin.jsx',
    'frontend/src/pages/Dashboard.jsx'
];

// Mapa de correccions (Garbage -> Correcte)
const replacements = [
    { find: /Ã /g, replace: 'à' },
    { find: /Ã©/g, replace: 'é' },
    { find: /Ã³/g, replace: 'ó' },
    { find: /Ã§/g, replace: 'ç' },
    { find: /Ãº/g, replace: 'ú' },
    { find: /Ã­/g, replace: 'í' },
    { find: /Ã/g, replace: 'à' }, // Cas genèric final
    { find: /ðŸ’°/g, replace: '💰' }, // Moneda
    { find: /ðŸ¥‡/g, replace: '🥇' }, // Medalla 1
    { find: /ðŸ¥ˆ/g, replace: '🥈' }, // Medalla 2
    { find: /ðŸ¥‰/g, replace: '🥉' }, // Medalla 3
    { find: /RÃ nking/g, replace: 'Rànking' },
    { find: /ClassificaciÃ³/g, replace: 'Classificació' }
];

console.log('🧹 Iniciant neteja de caràcters...');

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        replacements.forEach(rep => {
            content = content.replace(rep.find, rep.replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Arreglat: ${filePath}`);
        } else {
            console.log(`ℹ️  Cap canvi necessari: ${filePath}`);
        }
    } else {
        console.log(`⚠️  No trobat: ${filePath}`);
    }
});

console.log('✨ Neteja completada!');
