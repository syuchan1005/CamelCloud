<template>
  <div class="check">
    <div class="empty">
      <md-spinner :md-size="150" :md-stroke="3" md-indeterminate/>
      <div class="title">{{ $t('check.text') }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'check',
    mounted() {
      this.$http.get('/api/auth').then((response) => {
        this.$store.commit('setAuth', response.data);
        this.$router.push('/view');
      }).catch(() => {
        this.$snotify.error('Network Error', 'Login Failed');
        this.$router.push('/login');
      });
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';

  .check {
    @include emptyWrapper();
  }

  .empty {
    .title {
      margin-top: 30px;
    }
  }
</style>

<style lang="scss">
  @import 'variables';

  .check > .empty {
    .md-spinner > .md-spinner-draw {
      .md-spinner-path {
        stroke: $mainColor;
      }
    }
  }
</style>
