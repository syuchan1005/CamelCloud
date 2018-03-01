<template>
  <div class="file" @click="$emit('click', $event)" @contextmenu.stop.prevent="$refs.menu.open()">
    <div class="image" v-if="type === 'FILE'">Test</div>
    <icon class="image" v-else name="folder-open"/>
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
      name: {
        type: String,
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

  .file {
    width: $size;
    min-width: $size;
    height: $size + 20px;
    max-height: $size + 20px;
    cursor: default;
    @include disableSelect;
  }

  .file:hover {
    background-color: rgba(136, 136, 136, 0.1);
  }

  .image {
    width: $size;
    min-width: $size;
    height: $size;
    text-align: center;
    padding-top: calc(50% - 0.5rem);
  }

  .image.fa-icon {
    color: $mainColor;
    padding: 5px 5px 5px 10px;
  }

  .name {
    @include textEllipsis;
    text-align: center;
    font-size: 0.8rem;
    line-height: normal;
  }
</style>
