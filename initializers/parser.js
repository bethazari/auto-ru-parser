
const rp = require("request-promise");
const $ = require("cheerio");


class AutoRuParserInitializer {

  async start() {
    altha.logger.app.info("<==== Brands loading ====>");
    const brands = await this.loadBrands();
    altha.logger.app.info("<==== Models loading ====>");
    const html = await rp({
      url: brands[0].url,
      headers: {
        "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
      },
    });
    const parsedModels = $(".search-form-v2-list_type_popular > div > div > a", html)
      .map((i, link) => ({
        name: $(link).text(),
        url: $(link).attr("href"),
      }))
      .get();
    console.log(parsedModels);
  }

  async loadBrands() {
    altha.logger.app.info("Fetch brands from db...");
    const brands = await altha.mongo.main.db.collection("brands").find().toArray();
    if (brands && brands.length) {
      altha.logger.app.info(`There are ${brands.length} brands in db!`)
      return brands;
    } else {
      altha.logger.app.info("There is no brands in db, parsing...");
      const html = await rp({
        url: altha.configurator.configs.constants.catalogUrl,
        headers: {
          "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
        },
      });
      const parsedBrands = $(".search-form-v2-list_type_popular > div > div > a", html)
        .map((i, link) => ({
          name: $(link).text(),
          url: $(link).attr("href"),
        }))
        .get();
      altha.logger.app.info(`Parsed ${parsedBrands.length} brands!`);
      altha.logger.app.info(`Saving brands into db...`);
      await altha.mongo.main.db.collection("brands").insertMany(parsedBrands);
      return parsedBrands;
    }
  }
}

module.exports = AutoRuParserInitializer;

    //console.log($(".StatsAverage__price", html).text().match(/\d/g).join(""));
