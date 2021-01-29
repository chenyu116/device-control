process.env.APP_VERSION = require("./package.json").version;
process.env.APP_BUILDTIME = require("./package.json").buildTime;
module.exports = {
  transpileDependencies: ["vuetify"],
  assetsDir:
    process.env.NODE_ENV === "production"
      ? "control/" + process.env.APP_VERSION + "/" + process.env.APP_BUILDTIME
      : "",
  publicPath:
    process.env.NODE_ENV === "production"
      ? "https://signposs1.oss-cn-shenzhen.aliyuncs.com/"
      : "",
  productionSourceMap: false
};
