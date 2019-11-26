<template>
  <v-dialog v-model="show" persistent max-width="290" :dark="false">
    <v-card>
      <v-card-title class="title">{{ title }}？</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="confirm">确定</v-btn>
        <v-btn text @click="hide">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      title: "",
      callback: function() {}
    };
  },
  methods: {
    confirm() {
      this.hide();
      this.callback();
    },
    hide() {
      this.show = false;
      this.$confirm.hide();
    }
  }
};
</script>
