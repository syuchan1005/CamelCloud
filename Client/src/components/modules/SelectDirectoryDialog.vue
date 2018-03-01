<template>
  <div class="select-directory-dialog">
    <md-dialog ref="dialog">
      <md-dialog-title>Select Directory</md-dialog-title>

      <md-dialog-content class="dialog-content">
        <path-bar v-model="path" :icon="pathIcon" :separator="pathSeparator"
                  @clickBack="backPath" @clickNewFolder="openNewDir" @clickPath="movePath" />
        <vue-perfect-scrollbar class="list">
          <md-list>
            <md-list-item v-if="dirList.length" v-for="(dir, index) in dirList" :key="index" @click="path.push(dir.name)">
              {{ dir.name }}
            </md-list-item>
            <md-list-item v-if="!dirList.length" @click="openNewDir">
              <md-icon>add</md-icon>
              Create New Directory
            </md-list-item>
          </md-list>
        </vue-perfect-scrollbar>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="close(false)">Cancel</md-button>
        <md-button class="md-primary" @click="close(true)">Select</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!--suppress RequiredAttributes -->
    <md-dialog-prompt md-title="New Directory" md-input-placeholder="DirectoryName" md-ok-text="Create"
               @close="closeNewDirDialog" v-model="newDir" ref="newDirDialog"/>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';
  import PathBar from './PathBar';

  export default {
    components: {
      PathBar,
      VuePerfectScrollbar,
    },
    name: 'select-directory-dialog',
    model: {
      prop: 'path',
      event: 'change',
    },
    props: {
      path: {
        type: Array,
        default: () => [],
      },
      pathIcon: {
        type: Boolean,
        default: false,
      },
      pathSeparator: {
        type: String,
        default: '/',
      },
    },
    data() {
      return {
        opened: false,
        dirList: [],
        newDir: '',
      };
    },
    watch: {
      path() {
        if (this.opened) {
          this.getDirectories();
        }
      },
    },
    methods: {
      open() {
        this.opened = true;
        this.dirList = [];
        this.$refs.dialog.open();
      },
      close(state) {
        this.opened = false;
        this.$refs.dialog.close();
        this.$emit('close', state ? 'ok' : 'cancel');
      },
      getDirectories() {
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `query{files(path:"${this.path.join('/')}" fileFilter:DIRECTORY){name}}`,
          },
        }).then((response) => {
          this.dirList = response.data.data.files;
        });
      },
      openNewDir() {
        this.newDir = '';
        this.$refs.newDirDialog.open();
      },
      closeNewDirDialog(state) {
        if (state !== 'ok') return;
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `mutation {operateFile(data:{op:MKDIR,path:"${this.path.join('/')}",source:"${this.newDir}"} fileType:DIRECTORY){name}}`,
          },
        }).then((response) => {
          this.dirList = response.data.data.operateFile;
        });
      },
      backPath() {
        this.$emit('change', this.path.slice(0, this.path.length - 1));
      },
      movePath(index) {
        this.$emit('change', this.path.slice(0, index + 1));
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "../variables";
  @import "../general";

  .md-dialog-content {
    width: 45vw;
    overflow: hidden;

    .list {
      max-height: 45vh;
      border: 1px solid rgba(169, 169, 169, 0.6);
    }
  }
</style>
