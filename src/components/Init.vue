<template>
  <v-layout align-center="" justify-center="">
    <v-container v-show="!retry">
      <span class="subtitle-2">{{ value }} %</span>
      <v-progress-linear
        :active="true"
        :background-opacity="0.3"
        :buffer-value="100"
        :height="4"
        :value="value"
        color="primary"
      ></v-progress-linear>
    </v-container>
    <v-flex cols="12" v-show="retry" align-self-center="">
      <p class=" full-width">{{ err.text }}</p>
      <v-btn @click="initData" color="deep-orange" x-large="" text>
        <v-icon left>fa-redo</v-icon>
        <span>刷新重试</span>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import openapi from "../libs/openapi";
export default {
  components: {},
  data: () => ({
    retry: false,
    total: 0,
    finished: 0,
    value: 0,
    err: {
      text: "",
      retry: false
    }
  }),
  watch: {
    finished(val) {
      this.value = parseInt((val / this.total) * 100);
    }
  },
  created() {
    this.initData();
  },
  methods: {
    genErr(text, retry = true) {
      return { text: text, retry: retry };
    },
    initData() {
      this.retry = false;
      this.finished = 0;
      const initFunc = [
        this.initIndexedDB,
        this.initProject,
        this.initEquipmentList,
        this.initMapPolygon,
        this.initMapList
      ];
      let inProgress = false;
      const maxRetryTimes = 3;
      let retryTimes = 0;
      this.total = initFunc.length;
      const _this = this;
      const initInterval = setInterval(function() {
        if (retryTimes == maxRetryTimes) {
          clearInterval(initInterval);
          _this.retry = true;
          return;
        }
        if (!inProgress) {
          inProgress = true;
          Promise.mapSeries(initFunc, function(f) {
            return f();
          })
            .then(function() {
              clearInterval(initInterval);
              setTimeout(function() {
                _this.$store.commit("updateDataLoaded", true);
              }, 1000);
            })
            .catch(function(err) {
              _this.err = err;
              if (err.retry) {
                retryTimes++;
                _this.finished = 0;
                inProgress = false;
              } else {
                clearInterval(initInterval);
                _this.retry = true;
              }
            });
        }
      }, 1000);
    },
    initIndexedDB() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        const indexedDB =
          window.indexedDB ||
          window.msIndexedDB ||
          window.mozIndexedDB ||
          window.webkitIndexedDB;
        if (!indexedDB) {
          return reject(_this.genErr("不支持 IndexedDB", false));
        }
        const localDBVersion = parseInt(
          localStorage.getItem("deviceControl:dbVersion")
        );
        let newDBVersion = parseInt(_this.$store.state.dbVersion);
        newDBVersion = isNaN(newDBVersion) ? 1 : newDBVersion;
        if (isNaN(localDBVersion) || localDBVersion !== newDBVersion) {
          indexedDB.deleteDatabase(
            "deviceControl-" + _this.$store.state.projectID
          );
          localStorage.setItem("deviceControl:dbVersion", newDBVersion);
          location.reload();
        }
        if (_this.$store.state.db) {
          _this.finished++;
          resolve();
          return;
        }

        try {
          const openRequest = indexedDB.open(
            "deviceControl-" + _this.$store.state.projectID,
            newDBVersion
          );
          openRequest.onupgradeneeded = function(e) {
            const _db = e.target.result;
            _db.createObjectStore("mapPolygons", { keyPath: "map_id" });
            _db.createObjectStore("mapList", { keyPath: "map_id" });
            _db.createObjectStore("mapGroup", { keyPath: "map_id" });
            _db.createObjectStore("project", { keyPath: "project_id" });
            _db.createObjectStore("equipmentList", {
              keyPath: "equipment_code"
            });
          };
          openRequest.onsuccess = function(e) {
            _this.$store.commit("initDB", e.target.result);
            _this.finished++;
            resolve();
          };
          openRequest.onerror = function() {
            reject(_this.genErr("IndexedDB 初始化失败", false));
          };
        } catch (err) {
          reject(_this.genErr("IndexedDB 初始化失败", false));
        }
      });
    },
    initProject() {
      const _this = this;
      // return this.$store
      //   .dispatch("getProject")
      //   .then(function() {
      //     _this.finished++;
      //     return Promise.resolve();
      //   })
      //   .catch(function() {
      //     return Promise.reject(_this.genErr("读取项目详情失败"));
      //   });
      return new Promise(function(resolve, reject) {
        const readStore = _this.$store.state.db
          .transaction("project")
          .objectStore("project")
          .get(_this.$store.state.projectID);
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r) {
            _this.$store.commit("updateProject", r);
            _this.finished++;
            resolve();
          } else {
            openapi({
              url: "/v3/project",
              params: {
                project_id: _this.$store.state.projectID
              }
            })
              .then(function(resp) {
                const data = resp.data.data;
                _this.$store.commit("updateProject", data);
                const writeStore = _this.$store.state.db
                  .transaction("project", "readwrite")
                  .objectStore("project");
                writeStore.put(data);
                _this.finished++;
                resolve();
              })
              .catch(function(err) {
                console.log(err);
                reject(_this.genErr("读取项目详情失败"));
              });
          }
        };
      });
    },
    initEquipmentList() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        const readStore = _this.$store.state.db
          .transaction("equipmentList")
          .objectStore("equipmentList")
          .getAll();
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r && r.length > 0) {
            _this.finished++;
            resolve();
          } else {
            openapi({
              url: "/v3/equipment/list",
              params: {
                project_id: _this.$store.state.projectID
              }
            })
              .then(function(resp) {
                const data = resp.data.data.list;
                const writeStore = _this.$store.state.db
                  .transaction("equipmentList", "readwrite")
                  .objectStore("equipmentList");
                for (let i = 0; i < data.length; i++) {
                  writeStore.put(data[i]);
                }
                _this.finished++;
                resolve();
              })
              .catch(function() {
                reject(_this.genErr("读取设备列表失败"));
              });
          }
        };
      });
    },
    polygonFilter(item) {
      if (this.$store.state.excludeMaps.indexOf(item.map_id) > -1) {
        return false;
      }
      if (this.$store.state.allowCategoryType.length > 0) {
        if (
          this.$store.state.allowCategoryType.indexOf(
            item.map_polygon_category_type
          ) === -1
        ) {
          return false;
        }
      }
      if (this.$store.state.allowCategoryLevel.length > 0) {
        if (
          this.$store.state.allowCategoryLevel.indexOf(
            item.map_polygon_category_level
          ) === -1
        ) {
          return false;
        }
      }
      return true;
    },
    initMapPolygon() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        const readStore = _this.$store.state.db
          .transaction("mapPolygons")
          .objectStore("mapPolygons")
          .getAll();
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r && r.length > 0) {
            _this.finished++;
            resolve();
          } else {
            openapi({
              url: "/v3/map/polygon/list",
              params: {
                project_id: _this.$store.state.projectID
              }
            })
              .then(function(resp) {
                console.log(resp);
                const data = resp.data.data.list;
                const writeStore = _this.$store.state.db
                  .transaction("mapPolygons", "readwrite")
                  .objectStore("mapPolygons");
                const mapPolygons = {};
                for (let i = 0; i < data.length; i++) {
                  if (data[i].map_id && _this.polygonFilter(data[i])) {
                    if (!mapPolygons[data[i].map_id]) {
                      mapPolygons[data[i].map_id] = [];
                    }
                    mapPolygons[data[i].map_id].push(data[i]);
                  }
                }
                for (let i in mapPolygons) {
                  writeStore.put({ map_id: parseInt(i), val: mapPolygons[i] });
                }
                _this.finished++;
                resolve();
              })
              .catch(function() {
                reject(_this.genErr("读取点位信息失败"));
              });
          }
        };
      });
    },
    initMapList() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        const readStore = _this.$store.state.db
          .transaction("mapList")
          .objectStore("mapList")
          .count();
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r && r > 0) {
            _this.finished++;
            resolve();
          } else {
            openapi({
              url: "/v3/map/list",
              params: {
                project_id: _this.$store.state.projectID
              }
            })
              .then(function(resp) {
                const writeMapList = _this.$store.state.db
                  .transaction("mapList", "readwrite")
                  .objectStore("mapList");
                const data = resp.data.data.list;
                const mapGroup = {};
                for (let i = 0; i < data.length; i++) {
                  writeMapList.put(data[i]);
                  if (!mapGroup[data[i].map_pid]) {
                    mapGroup[data[i].map_pid] = [];
                  }
                  mapGroup[data[i].map_pid].push(data[i]);
                }
                const writeMapGroup = _this.$store.state.db
                  .transaction("mapGroup", "readwrite")
                  .objectStore("mapGroup");
                for (let mapID in mapGroup) {
                  writeMapGroup.put({
                    map_id: parseInt(mapID),
                    val: mapGroup[mapID]
                  });
                }
                _this.finished++;
                resolve();
              })
              .catch(function() {
                reject(_this.genErr("读取地图信息失败"));
              });
          }
        };
        readStore.onerror = function() {
          reject(_this.genErr("读取地图信息失败"));
        };
      });
    }
  }
};
</script>
