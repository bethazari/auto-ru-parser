
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
    altha.logger.app.info("<==== Generations loading ====>");
    let generations = [];
    for (let model of models) {
      generations = generations.concat(await this.loadGenerations(model));
    }
    console.log(generations.length);
    // # TODO: тут будет парсинг кузовов и цен по каждому - но только по выбранным юзером в интерфейсе моделям

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
    altha.logger.app.info(`Fetch generations for model ${model.name} from db...`);
    const generations = await altha.mongo.main.db.collection("generations").find({model: model.name}).toArray();
    if (generations && generations.length) {
      altha.logger.app.info(`There are ${generations.length} generations for model ${model.name} in db!`);
      return generations;
    } else {
      const html = await this._getAutoRuPageHtml(model.url);
      const parsedGenerations = $(".search-form-v2-list_step_generations > a", html)
        .map((i, link) => {
          const years = $(link).find(".search-form-v2-list__card-title").text();
          return {
            name: $(link).find(".search-form-v2-list__card-text").text(),
            url: $(link).attr("href"),
            model: model.name,
            brand: model.brand,
            image: $(link).find("img").attr("src"),
            start_year: years.split(" – ")[0],
            end_year: years.split(" – ")[1],
            created: new Date(),
            updated: new Date(),
          }
        })
        .get();
      altha.logger.app.info(`Parsed ${parsedGenerations.length} generations for model ${model.name}!`);
      altha.logger.app.info(`Saving generations into db...`);
      await altha.mongo.main.db.collection("generations").insertMany(parsedGenerations);
      return parsedGenerations;
    }
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
