import Vue from "vue";
import vuetify from "../vuetify";
import ToastComponent from "./Toast.vue";

const Toast = {};
let toastNode = null; // 存储loading节点元素
let isShow = false;
const ToastConstructor = Vue.extend(ToastComponent);

let appEl, timeoutInterval;
Toast.install = function(Vue) {
  Vue.prototype.$toast = function(msg, options) {
    if (msg === "") return;
    if (!appEl) {
      appEl = document.getElementById("app");
    }
    if (isShow) {
      clearTimeout(timeoutInterval);
      appEl.removeChild(toastNode.$el);
    }
    let opt = { timeout: 2000 };
    isShow = opt.show = true;
    if (options) {
      for (let property in options) {
        opt[property] = options[property];
      }
    }
    if (opt.timeout < 1000) opt.timeout = 1000;
    opt.msg = msg;
    toastNode = new ToastConstructor({
      vuetify,
      data: opt
    });
    toastNode.$mount(); // 挂在实例，为了获取下面的toastNode.$el
    appEl.appendChild(toastNode.$el);
    toastNode.show = isShow = true;
    timeoutInterval = setTimeout(() => {
      clearTimeout(timeoutInterval);
      toastNode.show = isShow = false;
      appEl.removeChild(toastNode.$el);
    }, opt.timeout - 100);
  };

  ["error", "success", "info", "purple"].forEach(function(type) {
    Vue.prototype.$toast[type] = function(msg, options) {
      if (!options) options = {};
      options.color = type;
      return Vue.prototype.$toast(msg, options);
    };
  });
  Vue.prototype.$toast["hide"] = function() {
    clearTimeout(timeoutInterval);
    toastNode.show = isShow = false;
    appEl.removeChild(toastNode.$el);
  };
};

export default Toast;
