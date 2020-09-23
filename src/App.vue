<template>
  <v-app>
    <v-layout v-if="!dataLoaded" text-center wrap>
      <Init></Init>
    </v-layout>
    <v-app-bar
      v-if="dataLoaded"
      app
      color="primary"
      elevation="1"
      class="white--text"
      dense=""
      >{{ $store.state.projectID }} |
      <div class="d-flex overflow-hidden" v-if="$store.state.equipmentCode">
        {{ $store.state.equipmentCode }}
      </div>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text class="white--text subtitle-1">
            操作
            <v-icon right="" dense="">fa-caret-square-down</v-icon>
          </v-btn>
        </template>
        <v-list dense="">
          <v-list-item
            @click="goPage('/overview')"
            v-if="$store.state.deviceDetails"
          >
            <v-list-item-icon>
              <v-icon dense="">fa-info-circle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              设备信息
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="goPage('/setting')"
            v-if="$store.state.deviceDetails"
          >
            <v-list-item-icon>
              <v-icon dense="">fa-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              设置
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="goPage('/message')"
            v-if="$store.state.deviceDetails"
          >
            <v-list-item-icon>
              <v-icon dense="">fa-info</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              推送消息
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="goPage('/message-select')"
            v-if="!$store.state.deviceDetails"
          >
            <v-list-item-icon>
              <v-icon dense="">fa-info</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              消息推送（可选设备）
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="goPage('/evacuate')"
            v-if="!$store.state.deviceDetails"
          >
            <v-list-item-icon>
              <v-icon dense="">fa-info</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              紧急情况
            </v-list-item-content>
          </v-list-item>
          <v-list-item></v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="goHome">
            <v-list-item-icon>
              <v-icon dense="">fa-list</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              设备列表
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="$store.state.deviceDetails"></v-divider>

          <v-list-item
            @click="
              $confirm({ title: '确定清除手机数据', callback: clearData })
            "
          >
            <v-list-item-icon>
              <v-icon dense="" color="error">fa-retweet</v-icon>
            </v-list-item-icon>
            <v-list-item-content class="error--text">
              清除手机数据
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content v-if="dataLoaded">
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import Init from "@/components/Init.vue";
export default {
  name: "App",

  components: {
    Init
  },
  computed: {
    dataLoaded() {
      return this.$store.state.dataLoaded;
    }
  },
  mounted() {},
  data: () => ({}),
  methods: {
    goHome() {
      this.$store.commit("updateEquipmentCode", null);
      this.$store.commit("updateDeviceDetails", null);
      this.$router.replace("/");
    },
    goPage(page) {
      this.$router.replace(page);
    },
    clearData() {
      localStorage.clear();
      this.$store.commit(
        "updateDbVersion",
        parseInt(this.$store.state.dbVersion + 1)
      );
      this.$store.commit("updateDataLoaded", false);
    }
  }
};
</script>
<style>
.v-application {
  background: #fff !important;
}
* {
  text-transform: none !important;
}
</style>
