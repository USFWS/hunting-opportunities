const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

const cheerio = require('cheerio');

const spritePath = 'src/images/svg/sprite.svg';
const htmlPath = 'src/html/index.html';
const htmlOutPath = 'dist/index.html';

const getHTML = readFileAsync(htmlPath, { encoding: 'utf8' });
const getSprite = readFileAsync(spritePath, { encoding: 'utf8' });

Promise.all([getHTML, getSprite])
  .then(([html, sprite]) => {
    const $ = cheerio.load(html);
    $('.svg-sprite').append(sprite);
    fs.writeFile(htmlOutPath, $.html(), 'utf8', (err) => { if (err) console.log(err); });
  })
  .catch(console.log);
