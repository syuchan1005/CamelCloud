<template>
  <div class="error">
    <div class="empty">
      <md-icon>error_outline</md-icon>
      <div class="title">{{ $t('error.title') }}</div>
    </div>
    <md-button class="md-raised md-warn" @click="clickGo" ref="goButton">
      {{ $t('error.goTop') }}
    </md-button>
    <span>{{ $t('error.afterSec', { time }) }}</span>
  </div>
</template>

<script>
  export default {
    name: 'error',
    title: 'Error',
    data() {
      return {
        time: 5,
        after: undefined,
      };
    },
    mounted() {
      this.after = setInterval(() => {
        this.time -= 1;
        if (this.time === 0) {
          clearInterval(this.after);
          this.$refs.goButton.$el.click();
        }
      }, 1000);
    },
    beforeDestroy() {
      clearInterval(this.after);
    },
    methods: {
      clickGo() {
        this.$store.commit('authType', '');
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
