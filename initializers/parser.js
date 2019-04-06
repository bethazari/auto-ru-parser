
const rp = require("request-promise");
const $ = require("cheerio");
const util = require("util");


class AutoRuParserInitializer {

  async start() {
    altha.logger.app.info("<==== Brands loading ====>");
    const brands = await this.loadBrands();
    altha.logger.app.info("<==== Models loading ====>");
    let models = [];
    for (let brand of brands) {
      models = models.concat(await this.loadModels(brand));
    }
    console.log(models.length);

  }

  async loadBrands() {
    altha.logger.app.info("Fetch brands from db...");
    const brands = await altha.mongo.main.db.collection("brands").find().toArray();
    if (brands && brands.length) {
      altha.logger.app.info(`There are ${brands.length} brands in db!`);
      return brands;
    } else {
      altha.logger.app.info("There is no brands in db, parsing...");
      const html = await this._getAutoRuPageHtml(altha.configurator.configs.constants.catalogUrl);
      const parsedBrands = $(".search-form-v2-list_type_popular > div > div > a", html)
        .map((i, link) => ({
          name: $(link).text(),
          url: $(link).attr("href"),
          created: new Date(),
          updated: new Date(),
        }))
        .get();
      altha.logger.app.info(`Parsed ${parsedBrands.length} brands!`);
      altha.logger.app.info(`Saving brands into db...`);
      await altha.mongo.main.db.collection("brands").insertMany(parsedBrands);
      return parsedBrands;
    }
  }

  async loadModels(brand) {
    altha.logger.app.info(`Fetch models for brand ${brand.name} from db...`);
    const models = await altha.mongo.main.db.collection("models").find({brand: brand.name}).toArray();
    if (models && models.length) {
      altha.logger.app.info(`There are ${models.length} models for brand ${brand.name} in db!`);
      return models;
    } else {
      const html = await this._getAutoRuPageHtml(brand.url);
      const parsedModels = $(".search-form-v2-list_type_popular > div > div > a", html)
        .map((i, link) => ({
          name: $(link).text(),
          url: $(link).attr("href"),
          brand: brand.name,
          created: new Date(),
          updated: new Date(),
        }))
        .get();
      altha.logger.app.info(`Parsed ${parsedModels.length} models for brand ${brand.name}!`);
      altha.logger.app.info(`Saving models into db...`);
      await altha.mongo.main.db.collection("models").insertMany(parsedModels);
      return parsedModels;
    }
  }

  async loadGenerations(model) {
    console.log(model);
  }

  async _getAutoRuPageHtml(url) {
    await this._delay(1000);
    return await rp({
      url,
      headers: {
        "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
      },
    });
  }

  async _delay(ms) {
    return util.promisify((ms) => setTimeout(() => {}, ms));
  }
}

module.exports = AutoRuParserInitializer;

    //console.log($(".StatsAverage__price", html).text().match(/\d/g).join(""));
