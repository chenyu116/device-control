import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseOptOptions: {
      opt: ""
    },
    project: {},
    projectID: parseInt(window.projectID),
    equipmentCode: null,
    deviceDetails: null,
    dataLoaded: false,
    db: null,
    dbVersion: window.dbVersion,
    setting: null,
    themes: window.themes,
    debug: window.debug,
    allowCategoryLevel: window.allowCategoryLevel,
    allowCategoryType: window.allowCategoryType,
    excludeMaps: window.excludeMaps,
    token: window.token,
    version: window.version
  },
  mutations: {
    updateDbVersion(state, value) {
      state.dbVersion = value;
    },
    updateProject(state, value) {
      state.project = value;
    },
    updateEquipmentCode(state, value) {
      state.equipmentCode = value;
    },
    updateDataLoaded(state, value) {
      state.dataLoaded = value;
    },
    updateDeviceDetails(state, value) {
      state.deviceDetails = value;
    },
    initDB(state, value) {
      state.db = value;
    }
  },
  actions: {},
  modules: {}
});
