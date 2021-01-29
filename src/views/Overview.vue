<template>
  <v-layout align-start="" justify-center="">
    <Progress v-if="loading.full" :opt="opt"></Progress>
    <v-col cols="12" v-if="$store.state.deviceDetails">
      <v-card flat="">
        <p class="title font-weight-bold">设备信息</p>
        <v-card-text class=" pt-0">
          <p class="black--text full-width">
            状态：<v-btn text @click="getStatus" :loading="loading.getStatus"
              ><span :class="status.class">{{ status.text }}</span
              ><v-icon size="14" right="">fa-redo</v-icon></v-btn
            >
          </p>
          <p class="black--text full-width">
            地图编号：{{ $store.state.deviceDetails.equipment_map_id }}
          </p>
          <p class="black--text full-width">
            类型：{{ $store.state.deviceDetails.equipment_type }}
          </p>
          <p class="black--text full-width">
            点位编号：{{ $store.state.deviceDetails.equipment_point_id }}
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
      </v-card>
    </v-col>
  </v-layout>
</template>

<script>
import openequ from "../libs/openequ";
/**
 * @apiDefine commonProperties
 * @apiParam (properties) {String} AppId 发送消息的客户端编号
 * @apiParam (properties) {String} ReplyTo 需要发送回执的消息编号。若不为空，则需要设置回执命令的ReplyTo为此内容，然后发送回执命令给AppId，成功后再执行命令
 * @apiParam (properties) {Json} Body 命令内容
 */
export default {
  components: {},
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
        },
        {
          title: "进入设置",
          icon: "fa-cog",
          callback: this.enterSetting
        },
        {
          title: "显示配置信息",
          icon: "fa-address-card",
          callback: this.showInfo
        }
      ],
      types: {
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
  mounted() {
    if (!this.$store.state.deviceDetails) {
      this.$router.replace("/");
      return;
    }
    this.getStatus();
  },
  methods: {
    sendOpt(options = {}, callback) {
      if (!options.opt) {
        return;
      }
      const code = this.$store.state.deviceDetails.equipment_code;
      options.project_id = this.$store.state.deviceDetails.equipment_project_id;
      // options.projects = this.$store.state.deviceDetails.equipment_projectId;
      options.codes = code;
      if (options.confirm === true) {
        options.messageId = code + "-" + new Date().getTime();
      }
      if (typeof options.args !== "object") {
        options.args = {};
      }
      options.payload = JSON.stringify({
        opt: options.opt
      });
      options.expiration = "10000";
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
          _this.opt.title = "命令发送成功";
          if (typeof callback === "function") {
            callback(options);
          }
        })
        .catch(function(err) {
          console.log(err);
          if (!err.body) {
            err.body = "操作失败";
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
    /**
     * @api {rabbitmq message} reboot 重启设备
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"reboot","args":{}}
     */
    reboot() {
      console.log("reboot");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "reboot";
      this.sendOpt(options);
    },
    /**
     * @api {rabbitmq message} refreshDB 清除前端数据库
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"refreshDB","args":{}}
     */
    refreshDB() {
      console.log("refreshDB");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "refreshDB";
      this.sendOpt(options);
    },
    /**
     * @api {rabbitmq message} refreshSW 升级前端代码
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"refreshSW","args":{}}
     */
    refreshSW() {
      console.log("refreshSW");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "refreshSW";
      this.sendOpt(options);
    },
    /**
     * @api {rabbitmq message} restartApp 重启前端应用
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"restartApp","args":{}}
     */
    restartApp() {
      console.log("restartApp");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "restartApp";
      this.sendOpt(options);
    },
    /**
     * @api {rabbitmq message} enterSetting 进入设置
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"enterSetting","args":{}}
     */
    enterSetting() {
      console.log("enterSetting");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "enterSetting";
      this.sendOpt(options);
    },
    /**
     * @api {rabbitmq message} showInfo 显示设备信息
     * @apiVersion 0.1.0
     * @apiUse commonProperties
     * @apiGroup Command
     * @apiSuccessExample {json} 命令内容示例:
     * {"opt":"showInfo","args":{}}
     */
    showInfo() {
      console.log("showInfo");
      const options = JSON.parse(JSON.stringify(this.options));
      options.opt = "showInfo";
      this.sendOpt(options);
    },
    getStatus() {
      const _this = this;
      this.loading.getStatus = true;
      openequ({
        url: "/v3/connected",
        params: {
          projects: this.$store.state.deviceDetails.equipment_project_id,
          codes: this.$store.state.deviceDetails.equipment_code
        }
      })
        .then(function(resp) {
          const data = resp.data.data.result;
          if (data[0].connected === 1) {
            _this.status.text = data[0].type;
            _this.status.class = "green--text";
          } else {
            _this.status.text = "离线";
            _this.status.class = "red--text";
          }
        })
        .catch(function() {
          _this.status.text = "读取状态失败";
          _this.status.class = "red--text";
        })
        .finally(function() {
          setTimeout(function() {
            _this.loading.getStatus = false;
          }, 500);
        });
    }
  }
};
</script>
