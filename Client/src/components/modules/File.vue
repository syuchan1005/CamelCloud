<template>
  <div class="file" @click="$emit('click', $event)" @contextmenu.stop.prevent="$refs.menu.open()">
    <div class="image" v-if="type === 'FILE'">
      <img v-if="hasThumbnail" :src="thumbnailURL" @error="hasThumbnail = false"/>
      <icon v-else class="image file" name="file-o"/>
    </div>
    <icon class="image folder" v-else name="folder-open"/>
    <div class="name">{{ name }}</div>

    <md-menu ref="menu">
      <!--suppress HtmlUnknownAttribute -->
      <div md-menu-trigger></div>
      <md-menu-content>
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
        thumbnailURL: '',
        hasThumbnail: false,
      };
    },
    watch: {
      name() {
        this.thumbnailURL = `/api/file?path=${this.path.join('/')}/${this.name}${this.$store.state.viewFilter === 'TRASH' ? '&folder=TRASH' : ''}`;
      },
    },
    mounted() {
      this.thumbnailURL = `/api/file?path=${this.path.join('/')}/${this.name}${this.$store.state.viewFilter === 'TRASH' ? '&folder=TRASH' : ''}`;
      this.hasThumbnail = this.thumb;
    },
    methods: {
      showButton(event) {
        // eslint-disable-next-line no-underscore-dangle
        return this._events[event] && this._events[event].length > 0;
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
