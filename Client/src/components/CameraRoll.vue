<template>
  <div class="select-mode" :class="{ empty: !files.length}">
    <div class="empty" v-if="!files.length">
      <md-icon>library_books</md-icon>
      <div class="title">Add your first photo</div>
    </div>
    <div v-else class="path">{{ path }}</div>
    <vue-perfect-scrollbar class="files">
      <file @click="fileClick(file)" v-for="(file, index) in files" :key="index" :name="file.name" :type="file.type" />
    </vue-perfect-scrollbar>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';
  import File from './File';

  export default {
    components: {
      file: File,
      VuePerfectScrollbar,
    },
    name: 'select-mode',
    title: 'SelectMode',
    data() {
      return {
        path: '> ',
        files: [],
      };
    },
    mounted() {
      this.getFiles();
    },
    watch: {
      path() {
        this.getFiles();
      },
    },
    methods: {
      getFiles() {
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `query{getFiles(path: "${this.path.replace(/> /g, '/')}"){name type}}`,
          },
        }).then((response) => {
          this.files = response.data.data.getFiles;
        });
      },
      fileClick(file) {
        if (file.type === 'DIRECTORY') {
          this.path += `${file.name} > `;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';

  .select-mode {
    height: 100%;
  }

  .select-mode.empty {
    @include emptyWrapper;
  }

  .path {
    margin: 10px;
    width: calc(100% - 20px);
    height: 22px;
    border: solid 1px lightgray;
    padding: 0 5px;
    @include textEllipsis;
  }

  .files {
    width: 100%;
    height: calc(100% - 42px);
    display: flex;
    flex-wrap: wrap;
  }

  .file {
    margin: 10px;
  }
</style>
