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
console.log(`🕵️  Buscant errors d'encoding a: ${targetDir}`);

walkDir(targetDir, function(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // 1. Arreglar "RÃ nking" (El patró Ã + espai invisible)
        // \u00C3\u00A0 és el codi exacte de 'à' mal interpretat
        content = content.replace(/R\u00C3\u00A0nking/g, 'Rànking'); 
        content = content.replace(/RÃ nking/g, 'Rànking');
        content = content.replace(/RÃ nking/g, 'Rànking'); // Amb non-breaking space
        
        // 2. Arreglar "AdministraciÃ³"
        content = content.replace(/Administraci\u00C3\u00B3/g, 'Administració');
        content = content.replace(/AdministraciÃ³/g, 'Administració');

        // 3. Arreglar "ClassificaciÃ³"
        content = content.replace(/Classificaci\u00C3\u00B3/g, 'Classificació');
        content = content.replace(/ClassificaciÃ³/g, 'Classificació');
        
        // 4. Arreglar Emojis comuns (moneda)
        content = content.replace(/ð\u009F\u0092\u00B0/g, '💰');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ARREGLAT: ${path.basename(filePath)}`);
        }
    } catch (err) {
        console.error(`❌ Error llegint ${filePath}:`, err.message);
    }
});
