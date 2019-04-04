const rp = require('request-promise');
const $ = require('cheerio');
const puppeteer = require('puppeteer');

const url = 'https://auto.ru/stats/cars/skoda/octavia/4560887/4560899/';

const parse = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
  });
  await page.goto(url);
  const html = await page.content();
  console.log($('.StatsAverage__price', html).text().match(/\d/g).join(""));
};

parse().then(() => process.exit(1));
    //console.log($('.StatsAverage__price', html).text().match(/\d/g).join(""));
    //console.log($('.Menu__group', html).text());
/*rp({
  url,
  headers: {
    "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
  }
})
  .then(function(html){

    console.log($('.Menu__group', html).text());
  })
  .catch(function(err){
    console.error(err);
  });
*/