<template>
  <div class="path">
    <md-button v-if="back" :disabled="!path.length" @click="$emit('clickBack')">
      <md-icon>arrow_back</md-icon>
    </md-button>
    <md-button v-if="uploadFile" @click="$emit('clickUploadFile')">
      <md-icon>file_upload</md-icon>
    </md-button>
    <md-button v-if="newFolder" @click="$emit('clickNewFolder')">
      <md-icon>create_new_folder</md-icon>
    </md-button>

    <vue-perfect-scrollbar :settings="{ suppressScrollY: true }" class="value-wrapper" ref="value-wrapper">
      <div class="value" ref="value">
        <md-icon v-if="icon" class="sep" @click="$emit('clickSeparator', 0)">{{ separator }}</md-icon>
        <div v-else class="sep" @click="$emit('clickSeparator', 0)">{{ separator }}</div>

        <div v-for="(p, i) in path" :key="i" class="wrap">
          <div class="path-string" @click="$emit('clickPath', i)">{{ p }}</div>

          <md-icon v-if="icon" class="sep" @click="$emit('clickSeparator', i + 1)">{{ separator }}</md-icon>
          <div v-else class="sep" @click="$emit('clickSeparator', i + 1)">{{ separator }}</div>
        </div>
      </div>
    </vue-perfect-scrollbar>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';

  export default {
    components: {
      VuePerfectScrollbar,
    },
    name: 'PathBar',
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
      back: {
        type: Boolean,
        default: true,
      },
      uploadFile: {
        type: Boolean,
        default: true,
      },
      newFolder: {
        type: Boolean,
        default: true,
      },
    },
    /*
    event: [
      clickBack,
      clickUploadFile,
      clickNewFolder,
      clickPath(index),
      clickSeparator(index),
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
