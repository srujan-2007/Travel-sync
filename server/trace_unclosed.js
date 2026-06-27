const fs = require('fs');
const lines = fs.readFileSync('./controllers/aiController.js', 'utf8').split('\n');
let tree = [];
for (let i = 306; i <= 585; i++) {
  let line = lines[i].trim();
  let opens = (line.match(/\{/g) || []).length;
  let closes = (line.match(/\}/g) || []).length;
  
  if (opens > 0 || closes > 0) {
      for (let j=0; j<opens; j++) tree.push(i+1);
      for (let j=0; j<closes; j++) {
          if (tree.length > 0) tree.pop();
      }
  }
  
  if (line.includes("didn't understand that")) {
      console.log('Unclosed blocks at line ' + (i+1) + ':');
      tree.forEach(lineNum => console.log('Line ' + lineNum + ': ' + lines[lineNum-1].trim()));
  }
}
