<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt">加载中...</Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">设置</p>
        <v-container fluid>
          <v-switch v-model="show_map" inset label="是否显示地图"></v-switch>
          <v-select
            :items="$store.state.themes"
            label="主题选择"
            outlined=""
            v-model="theme"
            color="grey"
            no-data-text="没有主题数据"
            dense=""
          ></v-select>
          <v-text-field
            label="旋转角度"
            v-model="form.rotate"
            :rules="rules"
            hide-details="auto"
          ></v-text-field>
        </v-container>
        <v-tabs
          background-color="white"
          color="white"
          right
          align-with-title
          hide-slider
          active-class="primary"
          v-model="currentFace"
        >
          <v-tab v-for="n in faces" :key="`face-${n}`">{{ n }}</v-tab>
          <v-tab-item v-for="n in faces" :key="`item-${n}`">
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-select
                    ref="mapList"
                    :items="mapList"
                    label="楼层选择"
                    outlined=""
                    v-model="selectMapID[n - 1]"
                    color="grey"
                    no-data-text="没有楼层数据"
                    dense=""
                  ></v-select>
                  <v-select
                    class="mb-4"
                    v-if="mapList.length > 0"
                    :loading="loading.points"
                    :disabled="loading.points"
                    v-model="distributorId[n - 1]"
                    :items="items[n - 1]"
                    label="点位选择"
                    multiple
                    hide-details
                    dense=""
                    :menu-props="{ offsetY: true, top: true, maxHeight: '200' }"
                    outlined=""
                    no-data-text="没有点位数据"
                  ></v-select>
                  <v-alert dense type="info" outlined=""
                    >选择好的点位会自动临时存储，可以全部配置好后再推送
                    <v-card-actions
                      ><v-spacer></v-spacer
                      ><v-btn
                        :ripple="{ class: 'red--text' }"
                        class="subtitle-1"
                        @click="showPreview()"
                        text
                      >
                        查看及排序
                      </v-btn>
                    </v-card-actions>
                  </v-alert>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
        </v-tabs>
        <!-- <v-select
          ref="mapList"
          :items="mapList"
          label="楼层选择"
          outlined=""
          v-model="selectMapID"
          color="grey"
          no-data-text="没有楼层数据"
          dense=""
        ></v-select>
        <v-select
          class="mb-4"
          v-if="mapList.length > 0"
          :loading="loading.points"
          :disabled="loading.points || !selectMapID"
          v-model="distributorId"
          :items="items"
          label="点位选择"
          multiple
          hide-details
          dense=""
          :menu-props="{ offsetY: true, top: true, maxHeight: '200' }"
          outlined=""
          no-data-text="没有点位数据"
        ></v-select>
        <v-alert dense type="info" outlined=""
          >选择好的点位会自动临时存储，可以全部配置好后再推送
          <v-card-actions
            ><v-spacer></v-spacer
            ><v-btn
              :ripple="{ class: 'red--text' }"
              class="subtitle-1"
              @click="viewSetting = true"
              text
            >
              查看及排序
            </v-btn>
          </v-card-actions>
        </v-alert> -->
        <v-card-actions class="mt-10">
          <v-btn
            :ripple="{ class: 'red--text' }"
            class="subtitle-1"
            block=""
            @click="
              $confirm({ title: '确定推送至设备', callback: updateSetting })
            "
          >
            <v-icon left dense="">fa-file-import</v-icon>
            推送至设备
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-dialog v-model="viewSetting" persistent scrollable fullscreen>
      <v-card flat="" tile="" class="unselect">
        <v-card-actions>
          <span class="subtitle-1">{{ currentFace + 1 }} 配置</span>
          <v-spacer></v-spacer>
          <v-btn color="" icon @click="changeSetting()"
            ><v-icon>fa-times</v-icon></v-btn
          >
        </v-card-actions>
        <v-divider></v-divider>
        <v-card-text>
          <p class=" mt-1">
            <v-chip color="white" label="">
              <v-icon left size="15" color="red">fa-map</v-icon>
              地图显示：<span v-if="form.show_map">是</span
              ><span v-if="!form.show_map">否</span>
            </v-chip>
          </p>
          <p class=" mt-1">
            <v-chip color="white" label="">
              <v-icon left size="15" color="red">fa-tag</v-icon>
              主题：<span>{{ form.theme }}</span>
            </v-chip>
          </p>

          <p
            v-for="(item, index) in previewPoints"
            :key="`previewPoints-${index}`"
          >
            <span class=" font-weight-bold">{{ item.map_name }}:</span>
            <v-spacer></v-spacer>
            <v-chip-group column="" style="width:80%;">
              <draggable style="width:100%;">
                <v-chip
                  small=""
                  label=""
                  v-for="(v, i) in item.val"
                  :key="`item-${i}`"
                  class=" mt-1 mr-1 chip"
                  outlined=""
                  :attr="JSON.stringify(v)"
                  draggable=""
                >
                  {{ v.name }}
                </v-chip></draggable
              ></v-chip-group
            >
          </p>
          <div style="height:10em"></div>
        </v-card-text>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import draggable from "vuedraggable";
import openequ from "../libs/openequ";
import openapi from "../libs/openapi";
export default {
  components: { draggable },
  data() {
    return {
      selection: 0,
      opt: {
        title: "加载中",
        finished: false
      },
      tags: [],
      items: [],
      mapList: [],
      maps: {},
      viewSetting: false,
      previewPoints: {},
      selectMapID: [],
      theme: {},
      show_map: false,
      form: {
        distributor_id: "",
        rotate: 0
      },
      loading: {
        full: false,
        points: false
      },
      deviceDetails: {},
      points: [],
      distributorId: [],
      initDistributorId: [],
      polygons: {},
      faces: 4,
      currentFace: 0,
      rules: [
        value =>
          (parseInt(value) < 360 && parseInt(value) >= 0) ||
          "角度在 0 ~ 359 之间"
      ]
    };
  },
  mounted() {
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
      return;
    }
    this.loading.full = true;
    const _this = this;
    this.getEquipment()
      .then(function() {
        return _this.initData();
      })
      .then(function() {
        return _this.initMapData();
      })
      .then(function(mapDetails) {
        return _this.initMapListData(mapDetails);
      })
      .then(function() {
        return _this.initPolygons();
      })
      .catch(function(err) {
        _this.opt.title = err.message;
        _this.opt.finished = true;
        console.log("catch", err);
        setTimeout(() => {
          _this.$router.replace("/overview");
        }, 1000);

        // _this.$router.go(-1);
        // console.log("_this.polygons", _this.polygons);
      })
      .finally(function() {
        _this.loading.full = false;
      });
  },
  watch: {
    selectMapID(val) {
      // console.log("watch selectMapID", val);
      if (!val[this.currentFace]) return;
      this.loadPointsData();
    },
    distributorId: {
      handler(val) {
        if (!val[this.currentFace]) return;
        // for (let m = 0; m < this.points[this.currentFace].length; m++) {
        //   this.points[this.currentFace][m].val = [];
        // }
        // for (let i = 0; i < val[this.currentFace].length; i++) {
        //   const v = val[this.currentFace][i];
        //   for (let m = 0; m < this.points[this.currentFace].length; m++) {
        //     if (v.map_id != this.points[this.currentFace][m].map_id) continue;
        //     if (v.map_gid) {
        //       this.points[this.currentFace][m].val.push(v);
        //       break;
        //     }
        //   }
        // }
        const dis = [];
        for (let i = 0; i < val.length; i++) {
          dis[i] = [];
          for (let x = 0; x < val[i].length; x++) {
            dis[i].push(val[i][x].mapGid);
          }
          dis[i] = dis[i].join(",");
        }
        const newDistributorId = [];
        for (let i = 0; i < val[this.currentFace].length; i++) {
          newDistributorId.push(val[this.currentFace][i].mapGid);
        }
        dis[this.currentFace] = newDistributorId.join(",");
        this.form.distributor_id = JSON.stringify(dis);
        localStorage.setItem(
          "deviceControl:setting-" + this.deviceDetails.equipment_code,
          JSON.stringify(this.form)
        );
      }
    }
  },
  methods: {
    getEquipment() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        openapi({
          url: "/v3/equipment",
          params: {
            equipment_id: _this.$store.state.deviceDetails.equipment_id
          }
        })
          .then(function(resp) {
            _this.deviceDetails = resp.data.data;
            resolve();
          })
          .catch(function(err) {
            console.log(err);
            reject(new Error("读取设备详情失败"));
          });
      });
    },
    changeSetting() {
      this.viewSetting = false;
      const chosen = document.getElementsByClassName("chip");
      const distributorIdStringArray = [];
      if (chosen && chosen.length > 0) {
        for (let i = 0; i < chosen.length; i++) {
          if (chosen[i].attributes.length > 0) {
            for (let a = 0; a < chosen[i].attributes.length; a++) {
              const attr = chosen[i].attributes[a];
              if (attr.name === "attr") {
                try {
                  const item = JSON.parse(attr.value);
                  distributorIdStringArray.push(item);
                } catch (e) {}
                break;
              }
            }
          }
        }
        this.distributorId[this.currentFace] = distributorIdStringArray;
        const newDistributorId = [];
        for (let i = 0; i < this.distributorId.length; i++) {
          if (this.distributorId[i].length === 0) {
            newDistributorId.push("");
          } else {
            const temp = [];
            for (let l = 0; l < this.distributorId[i].length; l++) {
              temp.push(this.distributorId[i][l].mapGid);
            }
            newDistributorId[i] = temp.join(",");
          }
        }
        this.form.distributor_id = JSON.stringify(newDistributorId);
        localStorage.setItem(
          "deviceControl:setting-" + this.deviceDetails.equipment_code,
          JSON.stringify(this.form)
        );
      }
    },
    initData() {
      const _this = this;
      return new Promise(function(resolve) {
        try {
          _this.initDistributorId = JSON.parse(
            _this.deviceDetails.distributor_id
          );
        } catch (e) {
          _this.initDistributorId = [_this.deviceDetails.distributor_id];
        }

        if (_this.initDistributorId.length === 1) {
          const el = document.getElementsByClassName("v-tabs-bar");
          if (el && el.length > 0) {
            el[0].parentNode.removeChild(el[0]);
          }
        }
        for (let i = 0; i < _this.initDistributorId.length; i++) {
          if (!_this.initDistributorId[i]) {
            _this.initDistributorId[i] = "";
          }
        }

        const rotate = _this.deviceDetails.equipment_rotate
          ? parseInt(_this.deviceDetails.equipment_rotate)
          : 0;

        _this.form.rotate = isNaN(rotate) ? 0 : rotate;

        for (let i = 0; i < _this.faces; i++) {
          _this.selectMapID.push(0);
          _this.distributorId[i] = [];
          _this.points[i] = [];
          _this.items[i] = [];
        }

        // try {
        //   _this.form.theme =
        //     _this.$store.state.themes.length > 0
        //       ? _this.$store.state.themes[0].value
        //       : "theme1";
        // } catch (e) {
        //   _this.form.theme = "theme1";
        // }
        _this.show_map = _this.deviceDetails.show_map ? true : false;
        if (_this.$store.state.themes.length) {
          for (let i = 0; i < _this.$store.state.themes.length; i++) {
            if (
              _this.$store.state.themes[i].value == _this.deviceDetails.theme
            ) {
              _this.theme = _this.$store.state.themes[i];
              break;
            }
          }
        }
        _this.form.distributor_id = JSON.stringify(_this.initDistributorId);

        // const form = {
        //   theme: this.form.theme,
        //   show_map: this.form.show_map,
        //   distributor_id: this.form.distributor_id
        // };

        const value = JSON.stringify(_this.form);
        localStorage.setItem(
          "deviceControl:setting-" + _this.deviceDetails.equipment_code,
          value
        );
        resolve();
      });
    },
    initMapData() {
      const _this = this;
      return new Promise(function(resolve, reject) {
        const readStore = _this.$store.state.db
          .transaction("mapList")
          .objectStore("mapList")
          .get(_this.deviceDetails.equipment_map_id);
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r) {
            resolve(r);
          } else {
            reject(new Error("地图信息加载失败"));
          }
        };
      });
    },
    initMapListData(mapDetails) {
      const _this = this;
      return new Promise(function(resolve) {
        _this.mapList = [];
        const mapList = [];
        _this.maps = {};
        const readStore = _this.$store.state.db
          .transaction("mapGroup")
          .objectStore("mapGroup")
          .get(mapDetails.map_pid);
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r && r.val) {
            for (let i = 0; i < r.val.length; i++) {
              _this.maps[r.val[i].map_id] = r.val[i].detailed_name;
              let sortOrder = parseInt(r.val[i].map_sort_order);
              if (isNaN(sortOrder)) {
                sortOrder = 0;
              }
              mapList.push({
                mapId: r.val[i].map_id,
                text: r.val[i].detailed_name,
                value: r.val[i].map_id,
                sortOrder: sortOrder
              });
            }
            mapList.sort(function(a, b) {
              return b.sortOrder - a.sortOrder;
            });
            _this.mapList = mapList;
            for (let l = 0; l < _this.points.length; l++) {
              for (let i = 0; i < mapList.length; i++) {
                _this.points[l].push({
                  mapName: mapList[i].text,
                  mapId: mapList[i].value,
                  val: []
                });
              }
            }
          }
          resolve();
        };
      });
    },
    initPolygons() {
      const _this = this;
      this.polygons = {};
      return Promise.map(this.mapList, function(map) {
        const mapId = map.mapId;
        return new Promise(function(resolve) {
          const readStore = _this.$store.state.db
            .transaction("mapPolygons")
            .objectStore("mapPolygons")
            .get(map.mapId);
          readStore.onsuccess = function(e) {
            const r = e.target.result;
            if (r && r.val && r.val.length > 0) {
              for (let m = 0; m < _this.initDistributorId.length; m++) {
                if (!_this.polygons[m]) {
                  _this.polygons[m] = {};
                }
                if (!_this.polygons[m][mapId]) {
                  _this.polygons[m][mapId] = [];
                }
                if (_this.initDistributorId[m] != "") {
                  const idSplit = _this.initDistributorId[m].split(",");
                  for (let i = 0; i < idSplit.length; i++) {
                    for (let x = 0; x < r.val.length; x++) {
                      if (idSplit[i] == r.val[x].map_gid) {
                        const item = {
                          mapId: r.val[x].map_id,
                          mapGid: r.val[x].map_gid,
                          name: r.val[x].name
                        };
                        _this.distributorId[m].push(item);
                        break;
                      }
                    }
                  }
                }
                for (let x = 0; x < r.val.length; x++) {
                  const item = {
                    mapId: r.val[x].map_id,
                    mapGid: r.val[x].map_gid,
                    name: r.val[x].name
                  };
                  _this.polygons[m][mapId].push(item);
                }
              }
            }
            resolve();
          };
        });
      });
    },
    loadPointsData() {
      this.items[this.currentFace] = [];

      const _this = this;
      if (!this.polygons[this.currentFace]) {
        return;
      }
      this.loading.points = true;

      const r = this.polygons[this.currentFace][
        this.selectMapID[this.currentFace]
      ];
      if (r) {
        for (let i = 0; i < r.length; i++) {
          const item = {
            mapId: r[i].mapId,
            mapGid: r[i].mapGid,
            name: r[i].name
          };
          _this.items[_this.currentFace].push({
            text: r[i].name,
            value: item
          });
        }
      }
      setTimeout(() => {
        _this.loading.points = false;
      }, 500);
    },
    callbackUpdateEquipment(options) {
      const d = JSON.parse(JSON.stringify(this.deviceDetails));
      d.distributor_id = options.args.distributor_id;
      d.equipment_rotate = options.args.rotate;
      d.theme = this.theme.value;
      d.show_map = this.show_map;
      const writeStore = this.$store.state.db
        .transaction("equipmentList", "readwrite")
        .objectStore("equipmentList");
      writeStore.put(d);
      this.$store.commit("updateDeviceDetails", d);
    },
    sendOpt(options = {}, callback) {
      if (!options.opt) {
        return;
      }
      const code = this.deviceDetails.equipment_code;
      options.project_id = this.deviceDetails.equipment_project_id;
      options.codes = code;
      if (typeof options.args !== "object") {
        options.args = {};
      }
      options.args.theme = this.theme;
      options.args.show_map = this.show_map ? 1 : 0;
      options.payload = JSON.stringify({
        opt: options.opt,
        args: options.args
      });
      options.compatible = true;

      const _this = this;
      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;
      openequ({
        url: "/v3/push",
        method: "POST",
        data: options
      })
        .then(function() {
          _this.opt.title = "配置发送成功";
          if (typeof callback === "function") {
            callback(options);
          }
        })
        .catch(function(err) {
          console.log(err);
          if (!err.body) {
            err.body = "操作失败，请重试";
          }
          _this.opt.title = err.body;
        })
        .finally(function() {
          _this.opt.finished = true;
          setTimeout(function() {
            _this.loading.full = false;
          }, 1500);
        });
    },
    genPreviewData() {
      this.viewSetting = true;
    },
    /**
     * @api {opt} updateSetting 更新前端配置
     * @apiVersion 0.1.0
     * @apiParam (properties) {String} AppId 发送消息的客户端编号
     * @apiParam (properties) {String} ReplyTo 需要发送回执的消息编号。若不为空，则需要设置回执命令的ReplyTo为此内容，然后发送回执命令给AppId，成功后再执行命令
     * @apiParam (properties) {Json} Body 命令内容
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"updateSetting","args":{"distributor_id":"457_301,457_300,457_4,457_2,459_4,459_3,459_15,459_13","show_map":true,"theme":"theme_1"}}
     */
    updateSetting() {
      let args = JSON.parse(
        localStorage.getItem(
          "deviceControl:setting-" + this.deviceDetails.equipment_code
        )
      );
      if (!args) {
        this.$toast.error("配置信息加载失败");
        return;
      }
      args.show_map = this.form.show_map ? 1 : 0;
      try {
        const dis = JSON.parse(args.distributor_id);
        if (this.deviceDetails.equipment_type != "led") {
          args.distributor_id = dis[0];
        }
      } catch (e) {
        this.$toast.error("配置信息解析失败");
        return;
      }
      args.rotate = parseInt(this.form.rotate);
      if (isNaN(args.rotate) || args.rotate > 359 || args.rotate < 0) {
        this.$toast.error("角度不正确");
        return;
      }

      // if (this.faces <= 1) {
      //   args.distributor_id = dis[0];
      // }
      const options = {
        opt: "updateSetting",
        expiration: "10000",
        confirm: true,
        args: args
      };

      this.sendOpt(options, this.callbackUpdateEquipment);
    },
    showPreview() {
      const distributor_id = this.distributorId[this.currentFace];
      const polygons = this.polygons[this.currentFace];

      this.previewPoints = [];
      // console.log("distributor_id", distributor_id);

      for (let m = 0; m < this.mapList.length; m++) {
        if (!this.previewPoints[m]) {
          this.previewPoints[m] = {
            map_name: this.mapList[m].text,
            val: []
          };
        }

        for (let i = 0; i < distributor_id.length; i++) {
          for (let p = 0; p < polygons[this.mapList[m].mapId].length; p++) {
            const polygon = polygons[this.mapList[m].mapId][p];
            if (distributor_id[i].mapGid == polygon.mapGid) {
              this.previewPoints[m].val.push(polygon);
              break;
            }
          }
        }
      }
      // console.log(this.previewPoints);
      // this.previewPoints = this.points[this.currentFace];

      this.viewSetting = true;
    }
  }
};
</script>
<style scoped>
.unselect {
  -webkit-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -ms-user-select: none; /* 以下两个属性目前并未支持，写在这里为了减少风险 */
  -o-user-select: none;
  user-select: none;
}
.v-tab {
  min-width: 60px !important;
}
</style>
