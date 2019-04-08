
const rp = require("request-promise");
const $ = require("cheerio");

const fs = require("fs");
const path = require("path");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);
const delay = util.promisify((ms, f) => setTimeout(f, ms));


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
    altha.logger.app.info("<==== Actualizing ====>");
    const { actualBrands, actualModels, actualGenerations } = this.actualize(brands, models, generations);

    altha.logger.app.info("<==== Generations images caching ====>");
    const images = await readDir(`${path.resolve(".")}/cdn/images`);
    for (let generation of actualGenerations) {
      await this.loadImage(generation, images);
    }

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
      altha.logger.app.info(`There are no models for brand ${brand.name} in db!`);
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
    altha.logger.app.info(`Fetch generations for brand ${model.brand}, model ${model.name} from db...`);
    const generations = await altha.mongo.main.db.collection("generations").find({model: model.name}).toArray();
    if (generations && generations.length) {
      altha.logger.app.info(`There are ${generations.length} generations for brand ${model.brand}, model ${model.name} in db!`);
      return generations;
    } else {
      altha.logger.app.info(`There are no generations for brand ${model.brand}, model ${model.name} in db!`);
      const html = await this._getAutoRuPageHtml(model.url);
      const parsedGenerations = $(".catalog-generation-summary__generations > div", html)
        .map((i, block) => {
          const info = $(block).find(".catalog-generation-summary__gen-info > div");
          const image = $(block).find("div").last();
          const link = $(block).find("a");
          return {
            name: $(info).last().text(),
            url: link.attr("href"),
            model: model.name,
            brand: model.brand,
            image: image.attr("style").replace(/background-image: url\(\/\/(.+)\);/, "$1"),
            start_year: info.first().text().split(" – ")[0],
            end_year: info.first().text().split(" – ")[1],
            created: new Date(),
            updated: new Date(),
          }
        })
        .get();
      altha.logger.app.info(`Parsed ${parsedGenerations.length} generations for brand ${model.brand}, model ${model.name}!`);
      altha.logger.app.info(`Saving generations into db...`);
      await altha.mongo.main.db.collection("generations").insertMany(parsedGenerations);
      return parsedGenerations;
    }
  }

  async loadImage(generation, images) {
    altha.logger.app.info(`Fetch image for brand ${generation.brand}, model ${generation.model}, generation ${generation.name} from fs...`);
    const imageExists = images.find(imageName => imageName === generation.image_name);
    if (!imageExists) {
      altha.logger.app.info(`There is no image for brand ${generation.brand}, model ${generation.model}, generation ${generation.name} on fs!`);
      const response = await this._getAutoRuImage(`http://${generation.image}`);
      const imageName = `${generation.name.replace(/\//g, "_")}.${response.headers["content-type"].split("image/")[1]}`;
      altha.logger.app.info(`Fetched image for brand ${generation.brand}, model ${generation.model}, generation ${generation.name}!`);
      await writeFile(`${path.resolve(".")}/cdn/images/${imageName}`, response.body, "binary");
      altha.logger.app.info(`Saving imagename into db...`);
      await altha.mongo.main.db.collection("generations").updateOne(
        { _id: new altha.helpers.utils.ObjectId(generation._id) },
        { $set: { image_name: imageName, updated: new Date() } },
      );
    }
  }

  async actualize(brands, models, generations) {
    const actualGenerations = generations.filter(generation => generation.end_year > 2006);
    altha.logger.app.info(`There are ${generations.length} actual generations!`);
    altha.logger.app.info(`Saving actual flags for generations into db...`);
    await Promise.all(
      actualGenerations.map(generation =>
        altha.mongo.main.db.collection("generations").updateOne(
          { _id: new altha.helpers.utils.ObjectId(generation._id) },
          { $set: { actual: true, updated: new Date() } },
        )
      )
    );

    const actualModelsNames = actualGenerations.map(generation => generation.model);
    const actualModels = models.filter(model => model.name in actualModelsNames);
    altha.logger.app.info(`There are ${models.length} actual models!`);
    altha.logger.app.info(`Saving actual flags for models into db...`);
    await Promise.all(
      actualModels.map(model =>
        altha.mongo.main.db.collection("models").updateOne(
          { _id: new altha.helpers.utils.ObjectId(model._id) },
          { $set: { actual: true, updated: new Date() } },
        )
      )
    );

    const actualBrandsNames = actualModels.map(model => model.brand);
    const actualBrands = brands.filter(brand = brand.name in actualBrandsNames);
    altha.logger.app.info(`There are ${brands.length} actual brands!`);
    altha.logger.app.info(`Saving actual flags for brands into db...`);
    await Promise.all(
      actualBrands.map(brand =>
        altha.mongo.main.db.collection("brands").updateOne(
          { _id: new altha.helpers.utils.ObjectId(brand._id) },
          { $set: { actual: true, updated: new Date() } },
        )
      )
    );

    return { actualBrands, actualModels, actualGenerations };
  }

  async _getAutoRuPageHtml(url) {
    await delay(1000);
    return await rp({
      url,
      headers: {
        "Cookie": "los=1; los=1; bltsr=1; bltsr=1",
      },
    });
  }

  async _getAutoRuImage(url) {
    await delay(1000);
    return await rp(url, {
      encoding: "binary",
      resolveWithFullResponse: true,
    });
  }

}

module.exports = AutoRuParserInitializer;

    //console.log($(".StatsAverage__price", html).text().match(/\d/g).join(""));
