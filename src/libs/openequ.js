import axios from "axios";
import store from "../store";

// create an axios instance
const service = axios.create({
  baseURL: "https://openequ.signp.cn", // api的base_url
  timeout: 20000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
    switch (config.method.toUpperCase()) {
      case "GET":
        if (!config.params) {
          config.params = {};
        }
        config.params.token = store.state.token;
        break;
      case "POST":
        if (!config.data) {
          config.data = {};
        }
        config.data.token = store.state.token;
        break;
    }
    // console.log(config);
    return config;
  },
  error => {
    // Do something with request error
    // console.log('EEEEE', error); // for debug
    Promise.reject(error);
  }
);

// respone interceptor
service.interceptors.response.use(
  response => {
    if (response.data.code !== 0) {
      return Promise.reject(response.data);
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

export default service;
