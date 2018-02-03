<template>
  <div id="app" :class="{ 'un-auth': !$route.meta.auth }">
    <div class="top">
      <div class="title">PicStorage</div>
      <md-button class="md-raised">
        <md-icon>exit_to_app</md-icon>
        Logout
      </md-button>
    </div>

    <md-list class="side" :data-side="list" v-if="!under480 || !$store.state.viewFilter">
      <md-list-item @click="$store.state.viewFilter = 'all'" :disabled="$store.state.viewFilter === 'all'">
        <md-icon>photo_library</md-icon>
        <span>Camera Roll</span>
      </md-list-item>

      <md-divider class="mobile"/>

      <md-list-item @click="$store.state.viewFilter = 'photo'" :disabled="$store.state.viewFilter === 'photo'">
        <md-icon>photo</md-icon>
        <span>Photos</span>
      </md-list-item>

      <md-divider class="mobile"/>

      <md-list-item @click="$store.state.viewFilter = 'video'" :disabled="$store.state.viewFilter === 'video'">
        <md-icon>video_label</md-icon>
        <span>Videos</span>
      </md-list-item>

      <md-divider class="mobile"/>

      <md-list-item @click="$store.state.viewFilter = 'favorite'" :disabled="$store.state.viewFilter === 'favorite'">
        <md-icon>star</md-icon>
        <span>Favorites</span>
      </md-list-item>

      <md-divider class="mobile"/>

      <md-list-item @click="$store.state.viewFilter = 'delete'" :disabled="$store.state.viewFilter === 'delete'">
        <md-icon>delete</md-icon>
        <span>Recently Deleted</span>
      </md-list-item>

      <md-list-item class="side-select">
        <div>Menu</div>
        <md-button-toggle md-single class="md-primary">
          <md-button class="md-toggle md-icon-button" @click="list = 'left'">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
          <md-button class="md-icon-button" @click="list = 'right'">
            <md-icon>keyboard_arrow_right</md-icon>
          </md-button>
        </md-button-toggle>
      </md-list-item>
    </md-list>

    <md-button class="md-icon-button" v-show="under480 && $store.state.viewFilter"
               @click="$store.state.viewFilter = undefined">
      <md-icon>arrow_back</md-icon>
    </md-button>

    <main class="always" v-if="!under480 || $route.path === '/' || (under480 && $store.state.viewFilter)">
      <router-view/>
    </main>

    <vue-snotify class="always"></vue-snotify>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        list: 'left',
        innerWidth: window.innerWidth,
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.innerWidth = window.innerWidth;
      },
    },
    computed: {
      under480() {
        return this.innerWidth <= 480;
      },
    },
  };
</script>

<style lang="scss">
  @import "components/variables";

  .un-auth {
    & > *:not(.always) {
      display: none;
    }

    & > main {
      display: block;
      margin: 0;
      width: 100%;
      height: 100%;
    }
  }

  html, body, #app, main {
    margin: 0;
    width: 100%;
    height: 100%;
  }

  #app {
    display: flex;
    flex-wrap: wrap;
  }

  main {
    width: calc(100% - 220px);
    height: calc(100% - 3rem);
  }

  .mobile {
    display: none;
  }

  .top {
    order: 0;

    width: 100%;
    height: 3rem;

    display: flex;
    flex-direction: row;
    justify-content: space-between;

    background: $mainColor;
    color: white;

    .title {
      font-size: 2rem;
      line-height: normal;
      margin-left: 10px;
    }
  }

  .side-select {
    margin-top: auto;
  }

  .side {
    width: 220px;
    height: calc(100% - 3rem);
  }

  .side[data-side="left"] {
    border-right: solid $dividerColor 1px;
  }

  .side[data-side="right"] {
    order: 2;
    border-left: solid $dividerColor 1px;
  }

  .md-list-item.md-disabled {
    background: rgba(0, 0, 0, 0.1);
  }

  @media all and (max-width: 480px) {
    .side {
      width: 100%;
    }

    main {
      width: 100%;
      height: calc(100% - 3rem - 40px);
    }

    li > .md-button {
      & > .md-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }

    .side-select {
      display: none;
    }

    .mobile {
      display: block;
    }
  }
</style>
