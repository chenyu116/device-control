<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="!$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">消息推送（可选设备）</p>
        <v-select
          label="设备选择"
          :items="list"
          v-model="selected"
          :disabled="loading.full"
          no-data-text="没有数据"
          outlined=""
          multiple=""
          dense=""
        >
          <template v-if="true" v-slot:selection="{ item, index }">
            <v-chip v-if="index === 0">
              <span>{{ item.text }}</span>
            </v-chip>
            <span v-if="index === 1" class="grey--text caption"
              >(+{{ selected.length - 1 }} 更多)</span
            >
          </template>
        </v-select>
        <v-select
          :items="types"
          label="消息类型"
          outlined=""
          :error="form.type === 'emergency' ? true : false"
          v-model="form.type"
          no-data-text="没有消息类型数据"
          dense=""
        ></v-select>
        <v-textarea
          label="消息内容"
          :error="form.type === 'emergency' ? true : false"
          outlined=""
          v-model="form.content"
        ></v-textarea>
        <v-row>
          <v-col cols="12">
            <v-slider
              :error="form.type === 'emergency' ? true : false"
              v-model="form.duration"
              label="显示时间（秒）"
              thumb-label="always"
              :min="3"
            ></v-slider>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-btn
            :ripple="{ class: 'red--text' }"
            class="subtitle-1"
            block=""
            @click="sendMessage"
          >
            <v-icon left dense="">fa-file-import</v-icon>
            推送消息
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-layout>
</template>

<script>
export default {
  components: {},
  mounted() {
    this.loadDeviceList();
  },
  data() {
    return {
      list: [],
      selected: [],
      opt: {
        title: "",
        finished: false
      },
      types: [
        {
          text: "普通消息",
          value: "notice"
        },
        {
          text: "紧急消息",
          value: "emergency"
        }
      ],
      loading: {
        full: false
      },
      form: {
        type: "",
        content: "",
        duration: 10
      },
      eTypes: {
        show: "展示屏",
        infowithfinder: "指路信息屏",
        info: "信息屏",
        infoandfinder: "信息屏+指路仪",
        projection: "投影设备",
        guide: "导览屏",
        infoandguider: "导览屏+信息屏",
        index: "索引屏",
        indexandfinder: "索引屏+指路仪",
        index_main: "主屏索引屏",
        info_main: "主屏信息屏"
      }
    };
  },
  methods: {
    /**
     * @api {rabbitmq message} message 推送消息
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"message","args":{"content":"测试消息","duration":10000,"type":"emergency"}}
     */
    sendMessage() {
      for (let i in this.form) {
        if (typeof this.form[i] === "string" && this.form[i].trim() === "") {
          alert("请填写完整");
          return;
        }
      }
      const _this = this;
      this.$confirm({
        title: "确定推送消息",
        callback: function() {
          const options = {
            opt: "message",
            expiration: "10000",
            confirm: false,
            args: Object.assign({}, _this.form)
          };

          _this.sendOpt(options);
        }
      });
    },
    sendOpt(options = {}) {
      if (!options.opt) {
        return;
      }

      // if (this.selected.length === this.list.length) {
      //   code = "all";
      // }
      options.project_id = "" + this.$store.state.projectID;
      options.codes = this.selected.join(",");
      if (typeof options.args !== "object") {
        options.args = {};
      }
      if (options.args.duration) {
        options.args.duration = options.args.duration * 1000;
      }
      options.token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2RlIjoiNmFzOSIsImV4cCI6IjIwMjAtMDktMjNUMDU6NTE6MzcuOTU5MTQ0MDA0KzA4OjAwIn0.G4rfeZfENuNnUsUEelptjvqkfzDnf2ERCDfUrgm4Ff0";
      options.payload = JSON.stringify(options.args);
      const _this = this;
      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;

      this.$http
        // .post(this.apiHost + "/opt", options)
        .post("http://192.168.1.232:5024/v3/push", options)
        .then(function() {
          _this.opt.title = "消息发送成功";
        })
        .catch(function(err) {
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
    loadDeviceList() {
      const _this = this;
      const readStore = _this.$store.state.db
        .transaction("equipmentList")
        .objectStore("equipmentList")
        .getAll();
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r) {
          for (let i = 0; i < r.length; i++) {
            const _type = _this.eTypes[r[i].equipment_type] || "";
            const item = {
              text: r[i].name + "[" + _type + "] " + r[i].equipment_code,
              value: r[i].equipment_code
            };
            _this.list.push(item);
            _this.selected.push(r[i].equipment_code);
          }
        } else {
          _this.errMsg = "读取设备列表失败";
        }
        _this.loading.full = false;
      };
      readStore.onerror = function() {
        _this.errMsg = "读取设备列表失败";
        _this.loading.full = false;
      };
    }
  }
};
</script>
