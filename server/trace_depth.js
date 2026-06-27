const fs = require('fs');
const lines = fs.readFileSync('./controllers/aiController.js', 'utf8').split('\n');
let opens = 0;
for (let i = 306; i <= 585; i++) {
  let line = lines[i].trim();
  opens += (line.match(/\{/g) || []).length;
  opens -= (line.match(/\}/g) || []).length;
  if (line.includes("didn't understand that")) {
      console.log('Line ' + (i+1) + ' depth: ' + opens);
  }
}
