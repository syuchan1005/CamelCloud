<template>
  <div id="app" :class="{ 'un-auth': !$route.meta.auth }">
    <div class="top">
      <div class="title">PicStorage</div>
      <md-button class="md-raised">
        <md-icon>settings</md-icon>
        Setting
      </md-button>
      <md-button class="md-raised" @click="clickLogout">
        <md-icon>exit_to_app</md-icon>
        Logout
      </md-button>
    </div>

    <md-list class="side" :data-side="list" v-show="!under480 || !$store.state.viewFilter">
      <div v-for="(filter, index) in filters" :key="index">
        <md-list-item @click="$store.commit('viewFilter', filter.name)"
                      :disabled="$store.state.viewFilter === filter.name">
          <md-icon>{{ filter.icon }}</md-icon>
          <span>{{ filter.label }}</span>
        </md-list-item>

        <md-divider class="mobile" v-show="filters.length - 1 !== index"/>
      </div>
    </md-list>

    <div class="side-select" v-show="!under800">
      <div>Menu</div>
      <md-button-toggle md-single class="md-primary">
        <md-button class="md-icon-button" :class="{ 'md-toggle': list === 'left' }" @click="listSide = 'left'">
          <md-icon>keyboard_arrow_left</md-icon>
        </md-button>
        <md-button class="md-icon-button" :class="{ 'md-toggle': list === 'center' }" @click="listSide = 'center'">
          <md-icon>keyboard_arrow_down</md-icon>
        </md-button>
        <md-button class="md-icon-button" :class="{ 'md-toggle': list === 'right' }" @click="listSide = 'right'">
          <md-icon>keyboard_arrow_right</md-icon>
        </md-button>
      </md-button-toggle>
    </div>

    <md-button class="md-icon-button" v-show="under480 && $store.state.viewFilter"
               @click="$store.commit('viewFilter', undefined)">
      <md-icon>arrow_back</md-icon>
    </md-button>

    <main class="always" :class="{ [list] : !noMenu }"
          v-show="!under480 || noMenu || (under480 && $store.state.viewFilter)">
      <router-view/>
    </main>

    <md-tabs md-centered class="md-transparent" data-side="center" v-if="list === 'center'" @change="(index) => $store.commit('viewFilter', filters[index].name)">
      <md-tab v-for="(filter, index) in filters" :key="index"
              :md-active="$store.state.viewFilter === filter.name"
              :md-label="filter.label" :md-icon="filter.icon" />
    </md-tabs>

    <vue-snotify class="always"></vue-snotify>
  </div>
</template>

<script>
  // noinspection JSUnusedGlobalSymbols
  export default {
    name: 'app',
    data() {
      return {
        listSide: 'left',
        filters: [
          {
            label: 'Camera Roll',
            icon: 'photo_library',
            name: 'all',
          },
          {
            label: 'Photos',
            icon: 'photo',
            name: 'photo',
          },
          {
            label: 'Videos',
            icon: 'video_label',
            name: 'video',
          },
          {
            label: 'Favorite',
            icon: 'star',
            name: 'favorite',
          },
          {
            label: 'Recently Deleted',
            icon: 'delete',
            name: 'delete',
          },
        ],
        innerWidth: window.innerWidth,
        tabChange: undefined,
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    },
    computed: {
      list() {
        if (this.under480) {
          return 'left';
        } else if (this.under800) {
          return 'center';
        }
        return this.listSide;
      },
      under480() {
        return this.innerWidth <= 480;
      },
      under800() {
        return this.innerWidth <= 800;
      },
      noMenu() {
        return !this.$route.meta.menu;
      },
    },
    watch: {
      under480(oldVal, newVal) {
        if (oldVal && !newVal && !this.$store.state.viewFilter) {
          this.$store.commit('viewFilter', 'all');
        }
      },
    },
    methods: {
      handleResize() {
        this.innerWidth = window.innerWidth;
      },
      clickLogout() {
        this.$store.commit('setLogin', false);
        this.$store.commit('viewFilter', undefined);
        this.$router.push({ path: '/' });
      },
    },
  };
</script>

<style lang="scss">
  @import "components/variables";

  .md-input {
    font-size: 16px !important;
  }

  .md-tab-header > div {
    text-transform: none;
  }

  .md-tabs {
    height: 72px;
  }

  .md-tabs-content {
    display: none;
  }

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

    background: $mainColor;
    color: white;

    .title {
      font-size: 2rem;
      line-height: normal;
      margin-left: 10px;
    }

    .title + * {
      margin-left: auto;
    }
  }

  .side-select {
    z-index: 2;

    position: absolute;
    bottom: 10px;
    display: flex;
    align-items: center;

    & > div {
      margin-left: 10px;
    }
  }

  .side[data-side="right"] + .side-select {
    right: 10px;
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

  .side[data-side="center"] {
    display: none;
  }

  main.center {
    width: 100%;
    height: calc(100% - 3rem - 72px);
  }

  .md-list-item.md-disabled {
    background: rgba(0, 0, 0, 0.1);

    &  > .md-button > * {
      color: #3F51B5;
    }
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

    .top {
      .title + * {
        min-width: 36px;
        width: 36px;
        padding: 0;
        font-size: 0;
      }
    }
  }

  @media all and (max-width: 380px) {
    .top {
      .md-button + .md-button {
        min-width: 36px;
        width: 36px;
        padding: 0;
        font-size: 0;
      }
    }
  }
</style>
