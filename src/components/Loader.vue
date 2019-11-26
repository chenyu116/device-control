<template>
  <v-dialog :fullscreen="true" persistent v-model="show">
    <v-layout
      justify-center
      align-center
      fill-height
      style="background-color: rgba(255, 255, 255, 0.6);"
    >
      <v-progress-circular
        indeterminate
        color="deep-orange"
        :size="70"
        :width="7"
      >
      </v-progress-circular>
    </v-layout>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      show: true
    };
  }
};
</script>
