<template>
  <div class="file" draggable="true" @click="$emit('click', $event)" @contextmenu.stop.prevent="$refs.menu.open()"
       @dragover.prevent="setEffect($event)" @drop.prevent="$emit('drop', $event)" @dragstart="$emit('dragstart', $event)">
    <div class="image" v-if="type === 'FILE'">
      <img v-if="hasThumbnail" draggable="false" :src="thumbnailURL"/>
      <icon v-else class="image file" name="file-o"/>
    </div>
    <icon class="image folder" v-else name="folder-open"/>
    <div class="name">{{ name }}</div>

    <md-menu ref="menu">
      <!--suppress HtmlUnknownAttribute -->
      <div md-menu-trigger></div>
      <md-menu-content>
        <md-menu-item @click="$emit('download', $event)" v-if="showButton('download')">
          <md-icon>{{ downloadIcon }}</md-icon>
          <span>{{ downloadText }}</span>
        </md-menu-item>
        <md-menu-item @click="$emit('move', $event)" v-if="showButton('move')">
          <md-icon>{{ moveIcon }}</md-icon>
          <span>{{ moveText }}</span>
        </md-menu-item>
        <md-menu-item @click="$emit('rename', $event)" v-if="showButton('rename')">
          <md-icon>{{ renameIcon }}</md-icon>
          <span>{{ renameText }}</span>
        </md-menu-item>
        <md-menu-item @click="$emit('remove', $event)" v-if="showButton('remove')">
          <md-icon>{{ removeIcon }}</md-icon>
          <span>{{ removeText }}</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
  export default {
    name: 'file',
    props: {
      path: {
        type: Array,
      },
      name: {
        type: String,
      },
      thumb: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'FILE',
      },
      viewFilter: {
        type: String,
      },
      downloadIcon: {
        type: String,
        default: 'file_download',
      },
      downloadText: {
        type: String,
        default: 'Download',
      },
      moveIcon: {
        type: String,
        default: 'open_with',
      },
      moveText: {
        type: String,
        default: 'Move',
      },
      renameIcon: {
        type: String,
        default: 'create',
      },
      renameText: {
        type: String,
        default: 'Rename',
      },
      removeIcon: {
        type: String,
        default: 'delete',
      },
      removeText: {
        type: String,
        default: 'Remove',
      },
    },
    data() {
      return {
        hasThumbnail: false,
        view: '',
      };
    },
    watch: {
      name() {
        this.view = this.viewFilter;
      },
    },
    computed: {
      thumbnailURL() {
        return `/api/file?path=${this.path.join('/')}/${this.name}${this.view === 'TRASH' ? '&folder=TRASH' : ''}`;
      },
    },
    mounted() {
      this.hasThumbnail = this.thumb;
      this.view = this.viewFilter;
    },
    methods: {
      showButton(event) {
        // eslint-disable-next-line no-underscore-dangle
        return this._events[event] && this._events[event].length > 0;
      },
      setEffect(event) {
        // eslint-disable-next-line
        event.dataTransfer.dropEffect = this.type === 'FILE' ? 'none' : 'move';
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "../general";
  @import "../variables";

  $size: 100px;

  div.file {
    width: $size;
    min-width: $size;
    height: $size + 20px;
    max-height: $size + 20px;
    cursor: default;
    user-select: none;
    user-drag: element;
    @include disableSelect;

    &:hover {
      background-color: rgba(136, 136, 136, 0.1);
    }
  }

  .image {
    width: $size;
    min-width: $size;
    height: $size;
    text-align: center;
    padding: 5px;

    &.folder {
      color: $mainColor;
      padding-left: 10px;
    }

    .file {
      color: ($mainColor + $subColor) / 2;
      width: $size * 0.9;
      min-width: $size * 0.9;
      height: $size * 0.9;
    }
  }

  .name {
    @include textEllipsis;
    text-align: center;
    font-size: 0.8rem;
    line-height: normal;
  }
</style>
