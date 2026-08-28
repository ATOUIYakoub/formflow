const fs = require('fs');
const paths = [
  'apps/web/src/app/page.tsx',
  'apps/web/src/app/register/page.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/web/src/app/(dashboard)/layout.tsx',
  'apps/web/src/app/(dashboard)/dashboard/page.tsx',
  'apps/web/src/app/globals.css'
];

paths.forEach(p => {
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if(p.endsWith('.tsx')) {
      content = content.replace(/dark:[^\s"']+/g, '');
      content = content.replace(/ +(?=")/g, ''); // cleanup trailing spaces before closing quote
      content = content.replace(/ +/g, ' '); // cleanup double spaces
    } else if(p.endsWith('.css')) {
      content = content.replace(/@media \(prefers-color-scheme: dark\) {[\s\S]*?}/, '');
    }
    fs.writeFileSync(p, content);
  }
});
console.log('Dark mode removed!');
