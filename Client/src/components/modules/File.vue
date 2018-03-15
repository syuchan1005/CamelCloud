<template>
  <div class="file" :draggable="draggable" @click="$emit('click', $event)" @contextmenu.stop.prevent="$refs.menu.open()"
       @dragover.prevent="setEffect($event)" @drop.prevent="$emit('drop', $event)"
       @dragstart="dragStart($event)" @dragend="dragging = false">
    <div class="image-wrapper">
      <div v-if="type === 'FILE'" class="image">
        <img v-if="thumbnailUrl && !errorThumb" draggable="false" :src="thumbnailUrl" @error="errorThumb = true"/>
        <icon v-else class="file" :class="{ errorThumb }" name="file-o"/>
      </div>
      <icon v-else class="image folder" name="folder-open"/>

      <md-icon v-if="type === 'FILE' && showButton('clickPreview')" class="md-size-2x preview" @click.native="$emit('clickPreview', $event)">
        photo_size_select_large
      </md-icon>
    </div>
    <div class="name">{{ name }}</div>

    <md-menu md-size="4" ref="menu">
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
      name: {
        type: String,
      },
      thumbnailUrl: {
        type: String,
        default: undefined,
      },
      type: {
        type: String,
        default: 'FILE',
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
      draggable: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        errorThumb: false,
        dragging: false,
      };
    },
    methods: {
      showButton(event) {
        // eslint-disable-next-line no-underscore-dangle
        return this._events[event] && this._events[event].length > 0;
      },
      setEffect(event) {
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = this.type === 'FILE' || this.dragging ? 'none' : 'move';
      },
      dragStart(event) {
        this.$emit('dragstart', event);
        this.dragging = true;
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

  .image-wrapper {
    position: relative;

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
        min-width: $size * 0.8;
        height: $size * 0.8;

        &.errorThumb {
          color: $errorColor;
        }
      }
    }

    &:hover > .preview {
      display: block;
    }

    .preview {
      display: none;
      position: absolute;
      top: $size / 4;
      left: $size / 4;
      color: white;
      background-color: rgba(0, 0, 0, 0.54);
      border-radius: 5px;
    }
  }

  .name {
    @include textEllipsis;
    text-align: center;
    font-size: 0.8rem;
    line-height: normal;
  }
</style>
