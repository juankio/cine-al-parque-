const fs = require('fs');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.82 2H4.18C2.976 2 2 2.976 2 4.18v15.64C2 21.024 2.976 22 4.18 22h15.64c1.204 0 2.18-.976 2.18-2.18V4.18C22 2.976 21.024 2 19.82 2Z"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 12h20"/><path d="M2 7h5"/><path d="M2 17h5"/><path d="M17 17h5"/><path d="M17 7h5"/></svg>`;

let content = fs.readFileSync('nuxt.config.ts', 'utf8');

// Insert SVG Favicon in app.head
content = content.replace(
  "meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]",
  `meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: \`data:image/svg+xml,\${svgIcon}\` }]`
);

fs.writeFileSync('nuxt.config.ts', content);
