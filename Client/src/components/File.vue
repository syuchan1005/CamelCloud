<template>
  <div class="file" @click="$emit('click', $event)">
    <div class="image" v-if="type === 'FILE'">Test</div>
    <icon class="image" v-else name="folder-open"/>
    <div class="name">{{ name }}</div>
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
    },
  };
</script>

<style lang="scss" scoped>
  @import "general";

  $size: 100px;

  .file {
    width: $size;
    min-width: $size;
    height: $size + 20px;
    max-height: $size + 20px;
    cursor: default;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .file:hover {
    background-color: rgba(111, 194, 255, 0.3);
  }

  .image {
    width: $size;
    min-width: $size;
    height: $size;
    text-align: center;
    padding-top: calc(50% - 0.5rem);
  }

  .image.fa-icon {
    padding: 5px 5px 5px 10px;
  }

  .name {
    @include textEllipsis;
    text-align: center;
    font-size: 0.8rem;
    line-height: normal;
  }
</style>
