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
      ></v-autocomplete>
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
      readStore.onsuccess = function(e) {
        const r = e.target.result;
        if (r) {
          for (let i = 0; i < r.length; i++) {
            _this.list.push(r[i].equipment_code);
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
