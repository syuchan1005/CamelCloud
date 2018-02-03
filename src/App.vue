<template>
  <div id="app" :class="{ 'un-auth': !$route.meta.auth }">
    <div>
      test
    </div>
    <main class="always">
      <router-view/>
    </main>
    <vue-snotify class="always"></vue-snotify>
  </div>
</template>

<script>
  export default {
    name: 'app',
  };
</script>

<style lang="scss">
  html, body, #app {
    margin: 0;
    width: 100%;
    height: 100%;
  }

  .un-auth {
    & > main {
      margin: 0;
      width: 100%;
      height: 100%;
    }

    & > *:not(.always) {
      display: none;
    }
  }
</style>
