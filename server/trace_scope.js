const fs = require('fs');
const lines = fs.readFileSync('./controllers/aiController.js', 'utf8').split('\n');
let tree = [];
for (let i = 280; i < 715; i++) {
  let line = lines[i].trim();
  let opens = (line.match(/\{/g) || []).length;
  let closes = (line.match(/\}/g) || []).length;
  
  if (opens > 0 || closes > 0) {
      for (let j=0; j<opens; j++) tree.push(i+1);
      for (let j=0; j<closes; j++) {
          if (tree.length > 0) tree.pop();
      }
  }
  
  if (line.includes(\"if (targetModule === 'CREATE_TRIP_INIT')\")) {
      console.log('CREATE_TRIP_INIT is at line ' + (i+1));
      console.log('It is nested inside blocks opened at lines:', tree);
      break;
  }
}
