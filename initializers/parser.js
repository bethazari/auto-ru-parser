
const rp = require('request-promise');
const $ = require('cheerio');


class AutoRuParserInitializer {

  async start() {
    const catalogUrl = 'https://auto.ru/catalog/cars/';

    const brands = await altha.mongo.main.db.collection("brands").find().toArray();
    if (brands && brands.length) {
      console.log(brands);
    } else {
      console.log('there is no brands in db, parsing...')
      const html = await rp({
        url: catalogUrl,
        headers: {
          "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
        },
      });
      const parsedBrands = $('.search-form-v2-list_type_popular > div > div > a', html)
        .map((i, link) => ({
          name: $(link).text(),
          url: $(link).attr('href'),
        }))
        .get();
      await altha.mongo.main.db.collection("brands").insertMany(parsedBrands);
      console.log('brands parsed successfully');
    }
  }
}

module.exports = AutoRuParserInitializer;

    //console.log($('.StatsAverage__price', html).text().match(/\d/g).join(""));
