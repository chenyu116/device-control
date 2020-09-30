import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseOptOptions: {
      opt: ""
    },
    project: {},
    projectID: window.projectID,
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
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2RlIjoiNmFzOSIsImV4cCI6IjIwMjAtMDktMjNUMDU6NTE6MzcuOTU5MTQ0MDA0KzA4OjAwIn0.G4rfeZfENuNnUsUEelptjvqkfzDnf2ERCDfUrgm4Ff0"
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
