const fs = require('fs');
const path = require('path');
const file = 'pages/login.vue';
let content = fs.readFileSync(file, 'utf8');

// The user wants a Pro Max design, let's inject Anime.js and remove Motion tags.
// I'll write the script manually or just replace the file.
