<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">设备信息</p>
        <v-card-text>
          <p class="black--text full-width">
            状态：<v-btn text @click="getStatus" :loading="loading.getStatus"
              ><span :class="status.class">{{ status.text }}</span
              ><v-icon size="14" right="">fa-redo</v-icon></v-btn
            >
          </p>
          <p class="black--text full-width">
            位置名称：{{ $store.state.deviceDetails.map_name }}
            {{ $store.state.deviceDetails.name }}
          </p>
          <p class="black--text full-width">
            mapGid：{{ $store.state.deviceDetails.equipment_map_id }}_{{
              $store.state.deviceDetails.gid
            }}
          </p>
          <p class="black--text full-width">
            旋转角度：{{ $store.state.deviceDetails.equipment_rotate }}
          </p>
          <p class="black--text full-width">
            版本：{{ $store.state.deviceDetails.equipment_version }}
          </p>
        </v-card-text>
        <v-btn
          v-for="(item, index) in opts"
          :key="index"
          block=""
          :ripple="{ class: 'red--text' }"
          @click="
            $confirm({ title: '确定 ' + item.title, callback: item.callback })
          "
          class="subtitle-1 mt-4"
        >
          <v-icon left dense="">{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <v-btn
          v-if="$store.state.project.project_emergency_evacuation === '0'"
          :ripple="{ class: 'red--text' }"
          class="subtitle-1 mt-5 white--text"
          block=""
          @click="$confirm({ title: '确定 紧急疏散', callback: enterExit })"
          color="red"
        >
          <v-icon left dense="">fa-running</v-icon>
          紧急疏散
        </v-btn>
        <v-btn
          v-else-if="$store.state.project.project_emergency_evacuation === '1'"
          :ripple="{ class: 'red--text' }"
          class="subtitle-1 mt-5 white--text"
          block=""
          @click="$confirm({ title: '确定 退出紧急疏散', callback: quitExit })"
          color="red"
        >
          <v-icon left dense="">fa-running</v-icon>
          退出紧急疏散
        </v-btn>
      </v-card>
    </v-col>
  </v-layout>
</template>

<script>
import Progress from "@/components/Progress.vue";
export default {
  name: "overview",
  components: { Progress },
  data() {
    return {
      opt: {
        title: "",
        finished: false
      },
      status: {
        class: "",
        text: ""
      },
      loading: {
        full: false,
        getStatus: false
      },
      options: {
        opt: "",
        expiration: "6000",
        confirm: true
      },
      opts: [
        {
          title: "重启设备",
          icon: "fa-power-off",
          callback: this.reboot
        },
        {
          title: "升级前端代码",
          icon: "fa-cloud-download-alt",
          callback: this.refreshSW
        },
        {
          title: "清除前端数据库",
          icon: "fa-trash-alt",
          callback: this.refreshDB
        },
        {
          title: "重启前端应用",
          icon: "fa-redo-alt",
          callback: this.restartApp
        }
      ]
    };
  },
  mounted() {
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
      return;
    }
    this.getStatus();
    // const p = Object.assign({}, this.$store.state.project);
    // p.project_emergency_evacuation = "1";
    // this.$store.commit("updateProject", p);
  },
  methods: {
    sendOpt(options = {}) {
      if (!options.opt) {
        return;
      }
      const code = this.$store.state.deviceDetails.equipment_code;
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
            _this.opt.title = "命令发送成功";
          },
          function(err) {
            if (!err.body) {
              err.body = "操作失败";
            }
            _this.opt.title = err.body;
          }
        )
        .finally(function() {
          _this.opt.finished = true;
          setTimeout(function() {
            _this.loading.full = false;
          }, 3000);
        });
    },
    enterExit() {
      console.log("enterExit");
      const options = Object.assign({}, this.options);
      options.opt = "enterExit";
      this.sendOpt(options);
    },
    quitExit() {
      console.log("quitExit");
      const options = Object.assign({}, this.options);
      options.opt = "quitExit";
      this.sendOpt(options);
    },
    reboot() {
      console.log("reboot");
      const options = Object.assign({}, this.options);
      options.opt = "reboot";
      this.sendOpt(options);
    },
    refreshDB() {
      console.log("refreshDB");
      const options = Object.assign({}, this.options);
      options.opt = "refreshDB";
      this.sendOpt(options);
    },
    refreshSW() {
      console.log("refreshSW");
      const options = Object.assign({}, this.options);
      options.opt = "refreshSW";
      this.sendOpt(options);
    },
    restartApp() {
      console.log("restartApp");
      const options = Object.assign({}, this.options);
      options.opt = "restartApp";
      this.sendOpt(options);
    },
    getStatus() {
      const _this = this;
      this.loading.getStatus = true;
      this.$http
        .get(this.apiHost + "/equipment/queue", {
          params: { code: this.$store.state.deviceDetails.equipment_code }
        })
        .then(
          function(resp) {
            if (resp.body) {
              if (resp.body.consumers > 0) {
                _this.status.text = "在线";
                _this.status.class = "green--text";
              } else {
                _this.status.text = "离线";
                _this.status.class = "red--text";
              }
            } else {
              _this.status.text = "无设备信息";
              _this.status.class = "";
            }
          },
          function() {
            _this.status.text = "读取状态失败";
            _this.status.class = "";
          }
        )
        .finally(function() {
          setTimeout(function() {
            _this.loading.getStatus = false;
          }, 1000);
        });
    }
  }
};
</script>
