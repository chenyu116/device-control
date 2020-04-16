module.exports = {
  transpileDependencies: ["vuetify"],
  assetsDir: process.env.NODE_ENV === "production" ? "control" : "",
  publicPath:
    process.env.NODE_ENV === "production" ? "https://o.signp.cn/" : "/",
  productionSourceMap: false
};
