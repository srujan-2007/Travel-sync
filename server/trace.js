const fs = require('fs');
let code = fs.readFileSync('./controllers/aiController.js', 'utf8');
const lines = code.split('\n');
for (let i = 705; i < 715; i++) {
  lines[i] = 'console.log(`AT LINE ' + (i+1) + '`); ' + lines[i];
}
fs.writeFileSync('./controllers/aiController.js', lines.join('\n'));
