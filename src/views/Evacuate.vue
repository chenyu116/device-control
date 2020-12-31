<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="!$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">紧急情况</p>
        <v-textarea
          v-if="$store.state.project.projectEmergencyEvacuation === '0'"
          label="中文内容"
          outlined=""
          v-model="content.zh_CN"
        ></v-textarea>
        <v-textarea
          v-if="$store.state.project.projectEmergencyEvacuation === '0'"
          label="英文内容"
          outlined=""
          v-model="content.en_US"
        ></v-textarea>
        <v-card-actions>
          <v-btn
            v-if="$store.state.project.projectEmergencyEvacuation === '0'"
            :ripple="{ class: 'red--text' }"
            class="subtitle-1 mt-5 white--text"
            block=""
            @click="enterExit"
            color="red"
          >
            <v-icon left dense="">fa-running</v-icon>
            紧急情况
          </v-btn>
          <v-btn
            v-else-if="$store.state.project.projectEmergencyEvacuation === '1'"
            :ripple="{ class: 'red--text' }"
            class="subtitle-1 mt-5 white--text"
            block=""
            @click="
              $confirm({ title: '确定 退出紧急情况', callback: quitExit })
            "
            color="red"
          >
            <v-icon left dense="">fa-running</v-icon>
            退出紧急情况
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
    // this.loadDeviceList();
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
      content: {
        zh_CN: "",
        en_US: ""
      },
      options: {
        expiration: "10000",
        confirm: false
      }
    };
  },
  methods: {
    callbackUpdateProject(options) {
      const p = JSON.parse(JSON.stringify(this.$store.state.project));
      switch (options.opt) {
        case "enterExit":
          p.projectEmergencyEvacuation = "1";
          break;
        case "quitExit":
          p.projectEmergencyEvacuation = "0";
          break;
      }
      this.$store.commit("updateProject", p);
      const writeStore = this.$store.state.db
        .transaction("project", "readwrite")
        .objectStore("project");
      writeStore.put(p);
      this.content = { zh_CN: "", en_US: "" };
    },
    /**
     * @api {rabbitmq message} enterExit 开启紧急情况
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"enterExit","args":{"en_US":"evacuate","zh_CN":"紧急情况中文内容"}}
     */
    enterExit() {
      // if (this.content.zh_CN.trim() === "") {
      //   alert("中文内容必须填写");
      //   return;
      // }
      const _this = this;
      this.$confirm({
        title: "确定进入紧急情况",
        callback: function() {
          const options = JSON.parse(JSON.stringify(_this.options));
          options.opt = "enterExit";
          options.args = _this.content;
          _this.sendOpt(options, _this.callbackUpdateProject);
        }
      });
    },
    /**
     * @api {rabbitmq message} quitExit 退出紧急情况
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"quitExit","args":{}}
     */
    quitExit() {
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "quitExit";
      this.sendOpt(options, this.callbackUpdateProject);
    },
    sendOpt(options = {}, callback) {
      if (!options.opt) {
        return;
      }
      const _this = this;
      // if (this.list.length === 0) {
      //   this.loading.full = true;
      //   this.opt.title = "设备列表读取失败！";
      //   setTimeout(function() {
      //     _this.loading.full = false;
      //   }, 2000);
      //   return;
      // }
      options.confirm = false;
      options.project_id = this.$store.state.project.projectId;
      if (typeof options.args !== "object") {
        options.args = {};
      }
      options.codes = "ALL";
      // options.codes = "ML5RRI6AS9";
      options.payload = JSON.stringify({
        opt: options.opt,
        args: options.args
      });
      options.token = this.$store.state.token;

      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;
      this.$http
        .post(this.grpcHost + "/push", options)
        // .post(this.apiHost + "/opt", options)
        .then(function() {
          _this.opt.title = "命令已发送";
          if (typeof callback === "function") {
            callback(options);
          }
        })
        .catch(function(err) {
          if (!err.body) {
            err.body = "操作失败，请重试";
          }
          _this.opt.title = err.body;
          // if (err.status !== 500 && typeof callback === "function") {
          //   callback(options);
          // }
        })
        .finally(function() {
          _this.opt.finished = true;
          setTimeout(function() {
            _this.loading.full = false;
          }, 2000);
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
            // const _type = _this.eTypes[r[i].equipment_type] || "";
            // const item = {
            //   text: r[i].name + "[" + _type + "] " + r[i].equipment_code,
            //   value: r[i].equipment_code
            // };
            _this.list.push(r[i].equipmentCode);
          }
        }
      };
    }
  }
};
</script>
