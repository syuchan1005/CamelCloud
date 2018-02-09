<template>
  <div class="error">
    <div class="empty">
      <md-icon>error_outline</md-icon>
      <div class="title">An error occurred</div>
    </div>
    <md-button class="md-raised md-warn" @click="clickGo" ref="goButton">Go to TopPage</md-button>
    <span>Go after {{ time }} seconds</span>
  </div>
</template>

<script>
  export default {
    name: 'error',
    title: 'Error',
    data() {
      return {
        time: 5,
      };
    },
    mounted() {
      const after = setInterval(() => {
        this.time -= 1;
        if (this.time === 0) {
          clearInterval(after);
          this.$refs.goButton.$el.click();
        }
      }, 1000);
    },
    methods: {
      clickGo() {
        this.$store.commit('viewFilter', undefined);
        this.$router.push({ path: '/' });
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';

  .error {
    @include emptyWrapper();
  }
</style>
