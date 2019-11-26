<template>
  <v-snackbar
    v-model="show"
    :top="position === 'top'"
    :bottom="position === 'bottom'"
    :left="position === 'left'"
    :right="position === 'right'"
    :color="color"
    :timeout="timeout"
    :vertical="vertical"
    class="subtitle-1"
  >
    {{ msg }}
    <v-btn dark icon @click="hide">
      <v-icon>fa-times</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      vertical: false,
      show: false,
      position: "top",
      timeout: 3000,
      msg: "",
      color: "error"
    };
  },
  methods: {
    hide() {
      this.show = false;
      this.$toast.hide();
    }
  }
};
</script>
