<template>
  <div class="media-viewer" v-if="isShow" :style="style">
    <div class="buttons">
      <div class="button move">
        <md-icon>open_with</md-icon>
      </div>
      <div class="button close" @click="isShow = false">
        <md-icon>clear</md-icon>
      </div>
    </div>

    <video v-if="isVideo" :src="url" controls autoplay></video>
    <img v-if="isImage" :src="url">
  </div>
</template>

<script>
  /* eslint no-underscore-dangle: [error, {allowAfterThis:true}] */
  import VideoPlayer from 'vue-video-player';

  export default {
    components: {
      VideoPlayer,
    },
    name: 'media-viewer',
    props: {
      width: {
        type: Number,
        default: 320,
      },
      height: {
        type: Number,
        default: 180,
      },
    },
    data() {
      return {
        imageOption: {
          inline: true,
          button: false,
          navbar: false,
          title: true,
          toolbar: false,
          tooltip: false,
          movable: true,
          zoomable: true,
          rotatable: false,
          scalable: false,
          transition: false,
          fullscreen: false,
          keyboard: false,
        },
        videoOption: {
          volume: 0.6,
          controls: true,
          sources: [],
        },
        mime: '',
        isShow: false,
        url: '',
      };
    },
    computed: {
      style() {
        const width = `${this.width}px`;
        const height = `${this.height}px`;
        return {
          width,
          height,
          'max-width': width,
          'max-height': height,
        };
      },
      isVideo() {
        return this.mime.startsWith('video/');
      },
      isImage() {
        return this.mime.startsWith('image/');
      },
      canShow() {
        return this.isVideo || this.isImage;
      },
    },
    methods: {
      show(url) {
        this.url = url;
        this._loadMime()
          .then((mime) => {
            this.mime = mime;
            if (this.canShow) {
              this.videoOption.sources = [{
                src: this.url,
                type: this.mime,
              }];
              this.isShow = true;
            } else {
              this.$snotify.error('Not Implements', 'Viewer');
            }
          })
          .catch(() => {
            this.$snotify.error('Network Error', 'Viewer');
          });
      },
      _loadMime() {
        return this.$http({
          method: 'get',
          url: this.url,
          responseType: 'blob',
          headers: { Range: 'bytes=0-0' },
        }).then(response => Promise.resolve(response.data.type));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .media-viewer {
    position: relative;
    background-color: rgba(0, 0, 0, 0.4);

    .buttons {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 5;
      display: flex;

      .button {
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        padding: 5px;
      }

      .move {
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .close {
        cursor: pointer;
      }
    }
  }
</style>
