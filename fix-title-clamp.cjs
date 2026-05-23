const fs = require('fs');
let content = fs.readFileSync('components/home/HomeBillboard.vue', 'utf8');

// Replace standard line-clamp with specific multi-line styling
content = content.replace(
  'class="font-black text-2xl leading-tight text-white drop-shadow-lg line-clamp-2"',
  'class="font-black text-2xl leading-tight text-white drop-shadow-lg break-words"'
);

fs.writeFileSync('components/home/HomeBillboard.vue', content);
