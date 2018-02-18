<template>
  <div class="select-directory-dialog">
    <md-dialog ref="dialog">
      <md-dialog-title>Select Directory</md-dialog-title>

      <md-dialog-content>
        <div class="path">
          <md-button :disabled="path === '> '" @click="backPath"><md-icon>arrow_back</md-icon></md-button>
          <md-button @click="openNewDir"><md-icon>create_new_folder</md-icon></md-button>
          <div class="value">{{ path }}</div>
        </div>
        <md-list>
          <md-list-item v-if="dirList.length" v-for="(dir, index) in dirList" :key="index" @click="path += `${dir.name} > `">
            {{ dir.name }}
          </md-list-item>
          <md-list-item v-if="!dirList.length" @click="openNewDir">
            <md-icon>add</md-icon>
            Create New Directory
          </md-list-item>
        </md-list>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="close(false)">Cancel</md-button>
        <md-button class="md-primary" @click="close(true)">Select</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog-prompt md-title="New Directory" md-input-placeholder="DirectoryName" md-ok-text="Create"
               @close="closeNewDirDialog" v-model="newDir" ref="newDirDialog"/>
  </div>
</template>

<script>
  export default {
    name: 'select-directory-dialog',
    model: {
      prop: 'path',
      event: 'change',
    },
    props: {
      path: {
        type: String,
        default: '> ',
      },
    },
    data() {
      return {
        dirList: [],
        newDir: '',
      };
    },
    watch: {
      path() {
        this.$emit('change', this.path);
        this.getDirectories();
      },
    },
    methods: {
      open() {
        this.dirList = [];
        this.getDirectories();
        this.$refs.dialog.open();
      },
      close(state) {
        this.$refs.dialog.close();
        this.$emit('close', state ? 'ok' : 'cancel');
      },
      getDirectories() {
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `query{getFiles(path:"${this.path.replace(/[ ]?> /g, '/')}" fileType:DIRECTORY){name}}`,
          },
        }).then((response) => {
          this.dirList = response.data.data.getFiles;
        });
      },
      openNewDir() {
        this.newDir = '';
        this.$refs.newDirDialog.open();
      },
      closeNewDirDialog(state) {
        if (state !== 'ok') return;
        const input = {
          op: 'MKDIR',
          path: this.path.replace(/[ ]?> /g, '/'),
          source: this.newDir,
        };
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: 'mutation OperateFile($input: opFile){operateFile(data:$input fileType:DIRECTORY){name}}',
            variables: { input },
          },
        }).then((response) => {
          this.dirList = response.data.data.operateFile;
        });
      },
      backPath() {
        const path = this.path;
        if (path !== '> ') this.path = path.substring(0, path.length - path.match('> (?=(.* > ){1})(?!(.* > ){2})')[1].length);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "variables";
  @import "general";

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

    .value {
      width: 100%;
      height: 22px;
      padding-left: 5px;
      border: solid 1px lightgray;
      @include textEllipsis;
      @include disableSelect;
    }
  }

  .md-list {
    border: 1px solid black;
  }
</style>
