const fs = require('fs');
const { promisify } = require('util');
const cheerio = require('cheerio');

const readFileAsync = promisify(fs.readFile);

const spritePath = 'dist/images/svg/sprite.svg';
const htmlPath = 'src/html/index.html';

const getHTML = readFileAsync(htmlPath, { encoding: 'utf8' });
const getSprite = readFileAsync(spritePath, { encoding: 'utf8' });

Promise.all([getHTML, getSprite])
  .then(([html, sprite]) => {
    const $ = cheerio.load(html);
    $('.svg-sprite').empty().append(sprite);
    fs.writeFile(htmlPath, $.html(), 'utf8', (err) => { if (err) console.log(err); });
  })
  .catch(console.log);
