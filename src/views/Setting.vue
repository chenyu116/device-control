<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">设置</p>
        <v-switch v-model="form.showMap" inset label="是否显示地图"></v-switch>
        <v-select
          :items="$store.state.themes"
          label="主题选择"
          outlined=""
          v-model="form.theme"
          color="grey"
          no-data-text="没有主题数据"
          dense=""
        ></v-select>
        <v-select
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
              查看配置信息
            </v-btn>
          </v-card-actions>
        </v-alert>
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
      <v-card flat="" tile="">
        <v-card-actions>
          <span class="subtitle-1">当前配置</span>
          <v-spacer></v-spacer>
          <v-btn color="" icon @click="viewSetting = false"
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
          <p v-for="(item, index) in points" :key="index">
            <span class=" font-weight-bold">{{ maps[index] }}:</span
            ><v-spacer></v-spacer>
            <v-chip
              small=""
              label=""
              v-for="(v, i) in item"
              :key="i"
              class=" mt-1 mr-1"
              outlined=""
              >{{ v.name }}</v-chip
            >
          </p>
        </v-card-text>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      opt: {
        title: "",
        finished: false
      },
      items: [],
      mapList: [],
      maps: {},
      viewSetting: false,
      selectMapID: "",
      form: {
        showMap: false,
        theme: "",
        distributor_id: ""
      },
      loading: {
        full: false,
        points: false
      },
      points: {},
      distributorId: [],
      initDistributorId: [],
      polygons: {}
    };
  },
  mounted() {
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
      return;
    }
    this.initData();
    this.initMapListData();
    this.initPolygons();
  },
  watch: {
    selectMapID(val) {
      if (val === "") return;
      this.loadPointsData();
    },
    distributorId: {
      handler(val) {
        const distributor_id = [];
        const points = {};
        for (let i = 0; i < val.length; i++) {
          if (val[i].map_gid) {
            distributor_id.push(val[i].map_gid);
            if (!points[val[i].map_id]) {
              points[val[i].map_id] = [];
            }
            points[val[i].map_id].push(val[i]);
          }
        }
        this.points = points;
        this.form.distributor_id = distributor_id.join(",");
        localStorage.setItem(
          "deviceControl:setting-" +
            this.$store.state.deviceDetails.equipment_code,
          JSON.stringify(this.form)
        );
      }
    }
  },
  methods: {
    initData() {
      this.initDistributorId = this.$store.state.deviceDetails.distributor_id.split(
        ","
      );
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
      this.form.distributor_id = this.$store.state.deviceDetails.distributor_id;
      localStorage.setItem(
        "deviceControl:setting-" +
          this.$store.state.deviceDetails.equipment_code,
        JSON.stringify(this.form)
      );
    },
    initMapListData() {
      const _this = this;
      const readStore = _this.$store.state.db
        .transaction("mapGroup")
        .objectStore("mapGroup")
        .get(_this.$store.state.deviceDetails.map_pid);
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r && r.val) {
          for (let i = 0; i < r.val.length; i++) {
            _this.maps[r.val[i].map_id] = r.val[i].detailed_name;
            _this.mapList.push({
              text: r.val[i].detailed_name,
              value: r.val[i].map_id
            });
          }
        }
      };
    },
    initPolygons() {
      const _this = this;
      const readStore = _this.$store.state.db
        .transaction("mapPolygons")
        .objectStore("mapPolygons")
        .getAll();
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r && r.length > 0) {
          for (let p in r) {
            _this.polygons[r[p].map_id] = r[p].val;
            for (let i = 0; i < r[p].val.length; i++) {
              const initIndex = _this.initDistributorId.indexOf(
                r[p].val[i].map_gid
              );
              if (initIndex > -1) {
                const item = {
                  map_id: r[p].val[i].map_id,
                  map_gid: r[p].val[i].map_gid,
                  name: r[p].val[i].point_name
                };
                _this.distributorId.push(item);
                _this.initDistributorId.splice(initIndex, 1);
              }
            }
          }
        }
      };
    },
    loadPointsData() {
      this.items = [];
      this.loading.points = true;
      const _this = this;
      if (this.polygons[this.selectMapID]) {
        const r = this.polygons[this.selectMapID];
        for (let i = 0; i < r.length; i++) {
          const item = {
            map_id: r[i].map_id,
            map_gid: r[i].map_gid,
            name: r[i].point_name
          };
          _this.items.push({
            text: r[i].point_name,
            value: item
          });
        }
        setTimeout(() => {
          _this.loading.points = false;
        }, 500);
      }
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
        .then(
          function() {
            _this.opt.title = "配置发送成功";
            if (typeof callback === "function") {
              callback(options);
            }
          },
          function(err) {
            if (!err.body) {
              err.body = "操作失败";
            }
            _this.opt.title = err.body;
            if (err.status !== 500 && typeof callback === "function") {
              callback(options);
            }
          }
        )
        .finally(function() {
          _this.opt.finished = true;
          setTimeout(function() {
            _this.loading.full = false;
          }, 3000);
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
      const options = {
        opt: "updateSetting",
        expiration: "10000",
        confirm: true,
        args: this.form
      };

      this.sendOpt(options, this.callbackUpdateEquipment);
    }
  }
};
</script>
