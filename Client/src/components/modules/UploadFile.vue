<template>
  <div class="upload-file">
    <file :name="name" type="FILE" :draggable="false"/>

    <div class="overlay">
      <md-spinner :md-size="100" :md-stroke="4" :md-progress="progress" />
      <div class="percentage">{{ progress }}%</div>
    </div>
  </div>
</template>

<script>
  import File from './File';

  export default {
    components: {
      File,
    },
    props: {
      name: {
        type: String,
      },
      progress: {
        type: Number,
        default: 0,
      },
    },
    name: 'UploadFile',
  };
</script>

<style lang="scss" scoped>
  @import "../general";
  @import "../variables";

  .upload-file {
    position: relative;

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(247, 247, 247, 0.5);

      .percentage {
        width: 100%;

        position: absolute;
        top: 29.5px;

        text-align: center;
        font-size: 30px;
        line-height: normal;
        color: $mainColor;
        @include disableSelect;
      }
    }
  }
</style>

<style lang="scss">
  @import '../variables';

  .upload-file > .overlay .md-spinner {
    transition-duration: 0s;

    & > .md-spinner-draw {
      .md-spinner-path {
        stroke: $mainColor;
      }
    }
  }
</style>
