
class Api {
  constructor(context) {
    this.context = context;
  }

  sendResponse(object) {
    this.context.response.data = object || { response: "ok" };
    if (object && object.error) {
      this.context.response.code = 500;
    }

    altha.webServer.sendResponse(this.context);
  }

  async getBrands() {
    const data = await altha.mongo.main.db.collection("brands").find({actual: true}).toArray();
    this.sendResponse(data);
  }

  async getModels() {
    const data = await altha.mongo.main.db.collection("models").find({actual: true}).toArray();
    this.sendResponse(data);
  }

  async getGenerations() {
    const data = await altha.mongo.main.db.collection("generations").find({actual: true}).toArray();
    this.sendResponse(data);
  }

  async getStats() {
    const data = await altha.mongo.main.db.collection("stats").find().toArray();
    this.sendResponse(data);
  }

}

module.exports = Api;