<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">消息推送</p>
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
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
    }
  },
  data() {
    return {
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
      }
    };
  },
  watch: {
    equipmentCode(val) {
      if (val) {
        this.loadEquipmentDetails();
      }
    }
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
            confirm: true,
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

      const code = this.$store.state.deviceDetails.equipment_code;
      options.project_id = this.$store.state.deviceDetails.equipment_project_id;
      options.codes = code;
      if (typeof options.args !== "object") {
        options.args = {};
      }
      if (options.args.duration) {
        options.args.duration = options.args.duration * 1000;
      }
      options.payload = JSON.stringify({
        opt: options.opt,
        args: options.args
      });
      options.token = this.$store.state.token;
      const _this = this;
      this.loading.full = true;
      this.opt.title = "处理中";
      this.opt.finished = false;
      this.$http
        // .post(this.apiHost + "/opt", options)
        .post(this.grpcHost + "/push", options)
        // .post("http://192.168.1.232:5024/v3/push", options)
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
    }
  }
};
</script>
