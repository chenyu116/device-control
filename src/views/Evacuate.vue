<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="!$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">紧急疏散</p>
        <v-textarea
          v-if="$store.state.project.project_emergency_evacuation === '0'"
          label="中文内容"
          :error="true"
          outlined=""
          v-model="content.zh_CN"
        ></v-textarea>
        <v-textarea
          v-if="$store.state.project.project_emergency_evacuation === '0'"
          label="英文内容"
          outlined=""
          v-model="content.en_US"
        ></v-textarea>
        <v-card-actions>
          <v-btn
            v-if="$store.state.project.project_emergency_evacuation === '0'"
            :ripple="{ class: 'red--text' }"
            class="subtitle-1 mt-5 white--text"
            block=""
            @click="enterExit"
            color="red"
          >
            <v-icon left dense="">fa-running</v-icon>
            紧急疏散
          </v-btn>
          <v-btn
            v-else-if="
              $store.state.project.project_emergency_evacuation === '1'
            "
            :ripple="{ class: 'red--text' }"
            class="subtitle-1 mt-5 white--text"
            block=""
            @click="
              $confirm({ title: '确定 退出紧急疏散', callback: quitExit })
            "
            color="red"
          >
            <v-icon left dense="">fa-running</v-icon>
            退出紧急疏散
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-layout>
</template>

<script>
export default {
  components: {},
  mounted() {},
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
      const p = Object.assign({}, this.$store.state.project);
      switch (options.opt) {
        case "enterExit":
          p.project_emergency_evacuation = "1";
          break;
        case "quitExit":
          p.project_emergency_evacuation = "0";
          break;
        default:
          return;
      }
      this.$store.commit("updateProject", p);
      this.content = { zh_CN: "", en_US: "" };
    },
    /**
     * @api {rabbitmq message} enterExit 开启紧急疏散
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"enterExit","args":{"en_US":"evacuate","zh_CN":"紧急疏散中文内容"}}
     */
    enterExit() {
      if (this.content.zh_CN.trim() === "") {
        alert("中文内容必须填写");
        return;
      }
      const _this = this;
      this.$confirm({
        title: "确定 紧急疏散",
        callback: function() {
          const options = Object.assign({}, _this.options);
          options.opt = "enterExit";
          options.args = _this.content;
          _this.sendOpt(options, _this.callbackUpdateProject);
        }
      });
    },
    /**
     * @api {rabbitmq message} quitExit 退出紧急疏散
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"quitExit","args":{}}
     */
    quitExit() {
      const options = Object.assign({}, this.options);
      options.opt = "quitExit";
      this.sendOpt(options, this.callbackUpdateProject);
    },
    sendOpt(options = {}, callback) {
      if (!options.opt) {
        return;
      }
      options.code = "all";
      options.project_id = this.$store.state.project.project_id;
      if (typeof options.args !== "object") {
        options.args = {};
      }
      if (options.args.duration) {
        options.args.duration = options.args.duration * 1000;
      }
      const _this = this;
      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;
      this.$http
        .post(this.apiHost + "/opt", options)
        .then(
          function() {
            _this.opt.title = "命令发送成功";
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
    }
  }
};
</script>
