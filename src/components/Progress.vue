<template>
  <v-dialog v-model="show" persistent width="300">
    <v-card color="primary">
      <v-card-text>
        <p
          class="subtitle-1 full-width text-center white--text font-weight-light"
        >
          {{ opt.title }}
        </p>
        <v-progress-linear
          :indeterminate="!opt.finished"
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    opt: {
      type: Object,
      default() {
        return {
          title: "处理中",
          finished: false
        };
      }
    }
  },
  data() {
    return {
      show: true
    };
  }
};
</script>
