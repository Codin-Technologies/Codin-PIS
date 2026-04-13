const https = require('https');

https.get('https://kongoniserengeticamp.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Look for color codes: #RRGGBB or #RGB or rgba(...) or var(--...)
    const hexColors = [...data.matchAll(/#([0-9A-Fa-f]{3,6})\b/g)];
    const uniqueHex = [...new Set(hexColors.map(m => m[0].toUpperCase()))];
    console.log('Hex Colors:', uniqueHex);

    // Look for style tags
    const styles = data.match(/<style[^>]*>([^<]+)<\/style>/g) || [];
    console.log('Styles length:', styles.length);

    // Any typography / link fonts?
    const fonts = [...data.matchAll(/font-family:([^;"]+)/g)];
    const uniqueFonts = [...new Set(fonts.map(m => m[1].trim()))];
    console.log('Fonts:', uniqueFonts);
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
