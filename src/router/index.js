import Vue from "vue";
import VueRouter from "vue-router";
import Overview from "../views/Overview.vue";
import Setting from "../views/Setting.vue";
import Index from "../views/Index.vue";
import Message from "../views/Message.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/message",
    name: "message",
    component: Message
  },
  {
    path: "/setting",
    name: "setting",
    component: Setting
  },
  {
    path: "/overview",
    name: "overview",
    component: Overview
  },
  {
    path: "*",
    name: "index",
    component: Index
  }
];

const router = new VueRouter({
  routes
});

export default router;
