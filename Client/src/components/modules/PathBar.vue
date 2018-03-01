<template>
  <div class="path">
    <md-button v-if="showButton('clickBack')" :disabled="!path.length" @click="$emit('clickBack')">
      <md-icon>arrow_back</md-icon>
    </md-button>
    <md-button v-if="showButton('clickUploadFile')" @click="$emit('clickUploadFile')">
      <md-icon>file_upload</md-icon>
    </md-button>
    <md-button v-if="showButton('clickNewFolder')" @click="$emit('clickNewFolder')">
      <md-icon>create_new_folder</md-icon>
    </md-button>

    <vue-perfect-scrollbar :settings="{ suppressScrollY: true }" class="value-wrapper" ref="value-wrapper">
      <div class="value" ref="value">
        <div v-if="icon" @click="clickSeparator(i + 1, $event)"><md-icon class="sep">{{ separator }}</md-icon></div>
        <div v-else class="sep" @click="clickSeparator(i + 1, $event)">{{ separator }}</div>

        <div v-for="(p, i) in path" :key="i" class="wrap">
          <div class="path-string" @click="$emit('clickPath', i)">{{ p }}</div>

          <div v-if="icon" @click="clickSeparator(i + 1, $event)"><md-icon class="sep">{{ separator }}</md-icon></div>
          <div v-else class="sep" @click="clickSeparator(i + 1, $event)">{{ separator }}</div>
        </div>
      </div>
    </vue-perfect-scrollbar>


    <div class="menu-back" v-if="menuOpen" @click="closeDirList"></div>
    <div class="md-menu-content md-active menu" :style="menu" v-if="menuOpen">
      <md-list>
        <md-list-item v-for="(dir, index) in dirList" :key="index" @click="closeDirList(index)">
          {{ dir.name }}
        </md-list-item>
      </md-list>
    </div>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';

  export default {
    components: {
      VuePerfectScrollbar,
    },
    name: 'PathBar',
    model: {
      prop: 'path',
      event: 'change',
    },
    props: {
      icon: {
        type: Boolean,
        default: false,
      },
      separator: {
        type: String,
        default: '/',
      },
      path: {
        type: Array,
        default: [],
      },
    },
    /*
    event: [
      clickBack,
      clickUploadFile,
      clickNewFolder,
      clickPath(index),
    ],
    */
    watch: {
      path() {
        setTimeout(() => {
          const wrapper = this.$refs['value-wrapper'].$el;
          wrapper.scrollLeft = wrapper.scrollWidth;
        }, 50);
      },
    },
    data() {
      return {
        dirList: [],
        menu: {
          top: '0px',
          left: '0px',
        },
        menuOpen: false,
      };
    },
    methods: {
      showButton(event) {
        // eslint-disable-next-line no-underscore-dangle
        return this._events[event] && this._events[event].length > 0;
      },
      clickSeparator(index, event) {
        this.menu.top = `${event.clientY + 10}px`;
        this.menu.left = `${event.clientX + 10}px`;
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `query{files(path:"${this.path.slice(0, index + 1).join('/')}" fileFilter:DIRECTORY){name}}`,
          },
        }).then((response) => {
          this.dirList = response.data.data.files;
          this.menuOpen = true;
        });
      },
      closeDirList(index) {
        this.menuOpen = false;
        if (typeof index === 'number') {
          this.$emit('change', this.path.concat(this.dirList[index].name));
        }
        this.dirList = [];
      },
    },
  };
</script>

<style lang="scss">
  .path > .value-wrapper {
    .ps__scrollbar-x-rail {
      width: 100% !important;
      height: 13px !important;
      display: block;

      background-color: #EEEEEE;
      opacity: 0.9;

      .ps__scrollbar-x {
        height: 9px !important;
        background-color: #999999;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import "../general";
  @import "../variables";

  .path {
    width: 100%;
    height: 48px;
    padding: 0 5px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .menu {
      z-index: 6;
      position: absolute;
    }

    .menu-back {
      z-index: 5;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .md-button {
      width: 38px;
      min-width: 38px;
      padding: 0;
      transform: scale(0.8);
    }

    .md-button:hover {
      color: $mainColor;
    }

    .value-wrapper {
      width: 100%;
      height: 37px;
      border: solid 1px lightgray;

      .value {
        @include disableSelect;
        display: flex;
        align-items: center;

        .wrap {
          display: flex;
        }

        .sep {
          height: 22px;
          padding: 0 5px;

          &.md-icon {
            transform: scale(0.6);
            padding: 0;
            margin: 0;
            line-height: normal;

            &:hover {
              padding: 0;
            }
          }

          &:hover:first-child {
            border-left: solid 1px rgba(255, 255, 255, 0);
          }

          &:hover:last-child {
            border-right: solid 1px rgba(255, 255, 255, 0);
          }

          &:hover {
            padding: 0 4px;
            border-left: 1px solid lightgray;
            border-right: 1px solid lightgray;
          }
        }

        .path-string {
          padding: 0 3px;
          white-space: nowrap;

          &:hover {
            padding: 0 2px;
            border-left: 1px solid lightgray;
            border-right: 1px solid lightgray;
          }
        }
      }
    }
  }
</style>
