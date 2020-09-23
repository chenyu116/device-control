<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">设置</p>
        <v-container fluid>
          <v-switch
            v-model="form.showMap"
            inset
            label="是否显示地图"
          ></v-switch>
          <v-select
            :items="$store.state.themes"
            label="主题选择"
            outlined=""
            v-model="form.theme"
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
                    :disabled="loading.points || !selectMapID"
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
              地图显示：<span v-if="form.showMap">是</span
              ><span v-if="!form.showMap">否</span>
            </v-chip>
          </p>
          <p class=" mt-1">
            <v-chip color="white" label="">
              <v-icon left size="15" color="red">fa-tag</v-icon>
              主题：<span>{{ form.theme }}</span>
            </v-chip>
          </p>

          <p v-for="(item, index) in previewPoints" :key="index">
            <span class=" font-weight-bold">{{ item.map_name }}:</span>
            <v-spacer></v-spacer>
            <v-chip-group column="" style="width:80%;">
              <draggable style="width:100%;">
                <v-chip
                  small=""
                  label=""
                  v-for="(v, i) in item.val"
                  :key="v.map_gid + i"
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
export default {
  components: { draggable },
  data() {
    return {
      selection: 0,
      opt: {
        title: "",
        finished: false
      },
      tags: [],
      items: [],
      mapList: [],
      maps: {},
      viewSetting: false,
      previewPoints: {},
      selectMapID: [],
      form: {
        showMap: false,
        theme: "",
        distributor_id: "",
        rotate: 0
      },
      loading: {
        full: false,
        points: false
      },
      points: [],
      distributorId: [],
      initDistributorId: [],
      polygons: {},
      faces: 4,
      currentFace: 0,
      rules: [
        value => (!!value && !isNaN(parseInt(value))) || "请填写角度",
        value =>
          (value && parseInt(value) < 360 && parseInt(value) >= 0) ||
          "角度在 0 ~ 359 之间"
      ]
    };
  },
  mounted() {
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
      return;
    }
    const _this = this;
    this.initData();
    this.initMapListData().then(function() {
      _this.initPolygons();
    });

    document.body.onselectstart = function() {
      return false;
    };
  },
  watch: {
    selectMapID(val) {
      if (val === "") return;
      this.loadPointsData();
    },
    distributorId: {
      handler(val) {
        console.log("watch distributorId", val);
        if (!val[this.currentFace]) return;
        for (let m = 0; m < this.points[this.currentFace].length; m++) {
          this.points[this.currentFace][m].val = [];
        }
        for (let i = 0; i < val[this.currentFace].length; i++) {
          const v = val[this.currentFace][i];
          for (let m = 0; m < this.points[this.currentFace].length; m++) {
            if (v.map_id != this.points[this.currentFace][m].map_id) continue;
            if (v.map_gid) {
              this.points[this.currentFace][m].val.push(v);
              break;
            }
          }
        }
        const newDistributorId = [];
        for (let i = 0; i < val.length; i++) {
          if (val[i].length === 0) {
            newDistributorId.push("");
          } else {
            const temp = [];
            for (let l = 0; l < val[i].length; l++) {
              temp.push(val[i][l].map_gid);
            }
            newDistributorId[i] = temp.join(",");
          }
        }
        this.form.distributor_id = JSON.stringify(newDistributorId);
        localStorage.setItem(
          "deviceControl:setting-" +
            this.$store.state.deviceDetails.equipment_code,
          JSON.stringify(this.form)
        );
      }
    }
  },
  methods: {
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
              temp.push(this.distributorId[i][l].map_gid);
            }
            newDistributorId[i] = temp.join(",");
          }
        }
        this.form.distributor_id = JSON.stringify(newDistributorId);
        localStorage.setItem(
          "deviceControl:setting-" +
            this.$store.state.deviceDetails.equipment_code,
          JSON.stringify(this.form)
        );
      }
    },
    initData() {
      try {
        this.initDistributorId = JSON.parse(
          this.$store.state.deviceDetails.distributor_id
        );
      } catch (e) {
        this.initDistributorId = [
          this.$store.state.deviceDetails.distributor_id
        ];
      }

      if (this.initDistributorId.length === 1) {
        const el = document.getElementsByClassName("v-tabs-bar");
        if (el && el.length > 0) {
          el[0].parentNode.removeChild(el[0]);
        }
      }

      this.form.rotate = parseInt(
        this.$store.state.deviceDetails.equipment_rotate
      );

      for (let i = 0; i < this.faces; i++) {
        this.selectMapID.push("");
        this.distributorId.push([]);
        this.points.push([]);
        this.items.push([]);
      }
      this.form.theme =
        this.$store.state.themes.length > 0
          ? this.$store.state.themes[0].value
          : "";
      let setting = this.$store.state.deviceDetails.setting;
      if (setting) {
        try {
          setting = JSON.parse(setting);
          this.form.showMap = setting.showMap;
          if (setting.theme) this.form.theme = setting.theme;
        } catch (e) {}
      }
      this.form.distributor_id = this.initDistributorId;

      // const form = {
      //   theme: this.form.theme,
      //   showMap: this.form.showMap,
      //   distributor_id: this.form.distributor_id
      // };

      const value = JSON.stringify(this.form);

      localStorage.setItem(
        "deviceControl:setting-" +
          this.$store.state.deviceDetails.equipment_code,
        value
      );
    },
    initMapListData() {
      const _this = this;
      return new Promise(function(resolve) {
        _this.mapList = [];
        const mapList = [];
        _this.maps = {};
        const readStore = _this.$store.state.db
          .transaction("mapGroup")
          .objectStore("mapGroup")
          .get(_this.$store.state.deviceDetails.map_pid);
        readStore.onsuccess = function(e) {
          const r = e.target.result;
          if (r && r.val) {
            for (let i = 0; i < r.val.length; i++) {
              _this.maps[r.val[i].map_id] = r.val[i].detailed_name;
              mapList.push({
                text: r.val[i].detailed_name,
                value: r.val[i].map_id,
                sortOrder: r.val[i].map_sort_order
              });
            }
            mapList.sort(function(a, b) {
              return parseInt(b.sortOrder) - parseInt(a.sortOrder);
            });
            _this.mapList = mapList;
            for (let l = 0; l < _this.points.length; l++) {
              for (let i = 0; i < mapList.length; i++) {
                _this.points[l].push({
                  map_name: mapList[i].text,
                  map_id: mapList[i].value,
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
      const readStore = _this.$store.state.db
        .transaction("mapPolygons")
        .objectStore("mapPolygons")
        .getAll();
      _this.polygons = {};
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r && r.length > 0) {
          // console.log("initIndex", r);
          for (let p in r) {
            _this.polygons[r[p].map_id] = r[p].val;
            for (let m = 0; m < _this.initDistributorId.length; m++) {
              if (_this.initDistributorId[m] == "") continue;
              const idSplit = _this.initDistributorId[m].split(",");
              for (let i = 0; i < r[p].val.length; i++) {
                if (idSplit.indexOf(r[p].val[i].map_gid) > -1) {
                  const item = {
                    map_id: r[p].val[i].map_id,
                    map_gid: r[p].val[i].map_gid,
                    name: r[p].val[i].name
                  };
                  _this.distributorId[m].push(item);
                  for (let l = 0; l < _this.points[m].length; l++) {
                    if (_this.points[m][l].map_id == item.map_id) {
                      _this.points[m][l].val.push(item);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      };
    },
    loadPointsData() {
      this.items[this.currentFace] = [];
      this.loading.points = true;
      const _this = this;
      const r = this.polygons[this.selectMapID[this.currentFace]];
      if (r) {
        for (let i = 0; i < r.length; i++) {
          const item = {
            map_id: r[i].map_id,
            map_gid: r[i].map_gid,
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
      const d = Object.assign({}, this.$store.state.deviceDetails);
      d.distributor_id = options.args.distributor_id;
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
      const code = this.$store.state.deviceDetails.equipment_code;
      // const code = "sp.server.queue.34e0dddf233916440a98a7b56aa44e67";
      options.project_id = this.$store.state.deviceDetails.equipment_project_id;
      options.code = code;
      if (options.confirm === true) {
        options.messageId = code + "-" + new Date().getTime();
      }
      if (typeof options.args !== "object") {
        options.args = {};
      }
      const _this = this;
      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;
      this.$http
        .post(this.apiHost + "/opt", options)
        .then(function() {
          _this.opt.title = "配置发送成功";
          if (typeof callback === "function") {
            callback(options);
          }
        })
        .catch(function(err) {
          if (!err.body) {
            err.body = "操作失败，请重试";
          }
          _this.opt.title = err.body;
          if (err.status !== 500 && typeof callback === "function") {
            callback(options);
          }
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
     * {"opt":"updateSetting","args":{"distributor_id":"457_301,457_300,457_4,457_2,459_4,459_3,459_15,459_13","showMap":true,"theme":"theme_1"}}
     */
    updateSetting() {
      let args = JSON.parse(
        localStorage.getItem(
          "deviceControl:setting-" +
            this.$store.state.deviceDetails.equipment_code
        )
      );
      if (!args) {
        this.$toast.error("配置信息加载失败");
        return;
      }
      try {
        const dis = JSON.parse(args.distributor_id);
        if (this.$store.state.deviceDetails.equipment_type != "led") {
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
      this.previewPoints = this.points[this.currentFace];
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
