<template>
  <v-layout align-start="" justify-center="">
    <v-col cols="12">
      <p class="title font-weight-bold">设备选择</p>
      <v-autocomplete
        label=""
        :items="list"
        v-model="equipmentCode"
        :disabled="loading.full"
        :error-messages="errMsg"
        no-data-text="没有数据"
        dense=""
      ></v-autocomplete>
      <v-btn
        depressed=""
        :ripple="{ class: 'red--text' }"
        class="subtitle-1 mt-12"
        block=""
        to="message-select"
        replace=""
      >
        <v-icon left dense="">fa-file-import</v-icon>
        消息推送（可选设备）
      </v-btn>
      <v-btn
        depressed=""
        :ripple="{ class: 'red--text' }"
        class="subtitle-1 mt-12"
        block=""
        to="evacuate"
        replace=""
      >
        <v-icon left dense="">fa-file-import</v-icon>
        紧急情况
      </v-btn>
    </v-col>
  </v-layout>
</template>

<script>
export default {
  name: "index",
  components: {},
  mounted() {
    this.loadDeviceList();
  },
  data() {
    return {
      equipmentCode: "",
      errMsg: "",
      list: [],
      loading: {
        full: true
      }
      // types: {
      //   show: "展示屏",
      //   infowithfinder: "指路信息屏",
      //   info: "信息屏",
      //   infoandfinder: "信息屏+指路仪",
      //   projection: "投影设备",
      //   guide: "导览屏",
      //   infoandguider: "导览屏+信息屏",
      //   index: "索引屏",
      //   indexandfinder: "索引屏+指路仪",
      //   index_main: "主屏索引屏",
      //   info_main: "主屏信息屏"
      // }
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
    loadEquipmentDetails() {
      this.errMsg = "";
      this.loading.full = true;
      const _this = this;
      const readStore = _this.$store.state.db
        .transaction("equipmentList")
        .objectStore("equipmentList")
        .get(this.equipmentCode);
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r) {
          _this.$store.commit("updateEquipmentCode", _this.equipmentCode);
          _this.$store.commit("updateDeviceDetails", r);
          _this.$router.replace("/overview");
        } else {
          _this.errMsg = "读取设备信息失败";
        }
        _this.loading.full = false;
      };
      readStore.onerror = function() {
        _this.errMsg = "读取设备信息失败";
        _this.loading.full = false;
      };
    },
    loadDeviceList() {
      const _this = this;
      const readStore = _this.$store.state.db
        .transaction("equipmentList")
        .objectStore("equipmentList")
        .getAll();
      const list = [];
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r) {
          for (let i = 0; i < r.length; i++) {
            const item = {
              text:
                "[" +
                (r[i].equipment_remark || " --- ") +
                "] " +
                r[i].equipment_code,
              value: r[i].equipment_code
            };
            list.push(item);
          }
          _this.list = list;
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
