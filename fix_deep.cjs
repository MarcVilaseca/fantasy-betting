const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = path.join(__dirname, 'frontend/src');
console.log(`🧹 Escanejant: ${targetDir}`);

walkDir(targetDir, function(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // MAPA DE CORRECCIONS MASSIU
        const fixes = [
            { bad: /RÃ nking/g, good: 'Rànking' },
            { bad: /RÃ nking/g, good: 'Rànking' },
            { bad: /RÃ\u00A0nking/g, good: 'Rànking' },
            { bad: /AdministraciÃ³/g, good: 'Administració' },
            { bad: /ClassificaciÃ³/g, good: 'Classificació' },
            { bad: /acciÃ³/g, good: 'acció' },
            { bad: /PosiciÃ³/g, good: 'Posició' },
            { bad: /PuntuaciÃ³/g, good: 'Puntuació' },
            { bad: /demÃ©s/g, good: 'demés' },
            { bad: /perÃ²/g, good: 'però' },
            { bad: /Ã©/g, good: 'é' },
            { bad: /Ã /g, good: 'à' },
            { bad: /ðŸ’°/g, good: '💰' }, // Bosses diners
            { bad: /ð\u009F\u0092\u00B0/g, good: '💰' },
            { bad: /ðŸ¥‡/g, good: '🥇' }, // Or
            { bad: /ðŸ¥ˆ/g, good: '🥈' }, // Plata
            { bad: /ðŸ¥‰/g, good: '🥉' }  // Bronze
        ];

        fixes.forEach(fix => {
            content = content.replace(fix.bad, fix.good);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ CORREGIT: ${path.basename(filePath)}`);
        }
    } catch (err) {
        console.error(`❌ Error: ${filePath}`);
    }
});
