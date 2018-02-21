<template>
  <div class="select-mode" @dragover.prevent="drag = true">
    <path-bar v-model="path" :icon="Config.separator.icon" :separator="Config.separator.value"
              @clickBack="backPath" @clickUploadFile="uploadFile" @clickNewFolder="openNewDir"
              @clickPath="movePath"/>

    <div class="empty-wrapper" v-if="!files.length">
      <div class="empty" @click="uploadFile">
        <md-icon>library_books</md-icon>
        <div class="title">Add your first photo</div>

        <md-button class="md-raised newDir" @click.stop="openNewDir">
          <md-icon>add</md-icon>
          or create directory
        </md-button>
      </div>
    </div>

    <vue-perfect-scrollbar v-if="files.length" class="files-wrapper" @contextmenu.native.prevent="click($event)">
      <div class="files">
        <file @click="fileClick(file)" v-for="(file, index) in files" :key="index"
              :name="file.name" :type="file.type" @move="moveFile(file)" @rename="renameFile(file)"
              @remove="removeFile(file)"/>
      </div>
    </vue-perfect-scrollbar>

    <md-menu md-size="4" ref="menu" :style="menu">
      <!--suppress HtmlUnknownAttribute -->
      <div md-menu-trigger></div>

      <md-menu-content>
        <md-menu-item @click="openNewDir">
          <md-icon>add</md-icon>
          <span>Create New Folder</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>

    <!--suppress RequiredAttributes -->
    <md-dialog-prompt :md-title="dialog.title" :md-input-placeholder="dialog.placeholder"
                      :md-ok-text="dialog.okText" @close="closeDialog" v-model="dialog.value" ref="dialog"/>

    <select-directory-dialog v-model="dialog.path" ref="selDirDialog" @close="closeDialog"/>

    <div class="drag" v-if="drag" @dragleave.prevent="drag = false" @drop.prevent="dropFile($event)">
      Drop your picture
    </div>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';
  import Config from '../../../config';
  import File from './modules/File';
  import SelectDirectoryDialog from './modules/SelectDirectoryDialog';
  import PathBar from './modules/PathBar';

  export default {
    components: {
      File,
      VuePerfectScrollbar,
      SelectDirectoryDialog,
      PathBar,
    },
    name: 'explorer',
    title: 'Explorer',
    data() {
      return {
        path: [],
        files: [],
        menu: {
          top: '0px',
          left: '0px',
        },
        dialog: {
          op: '',
          title: '',
          placeholder: '',
          okText: '',
          value: '',
          path: [],
          file: undefined,
        },
        drag: false,
        Config,
      };
    },
    mounted() {
      if (!this.under480 && !this.$store.state.viewFilter) {
        this.$store.commit('viewFilter', 'all');
      }
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
            query: `query{getFiles(path: "/${this.path.join('/')}"){name type}}`,
          },
        }).then((response) => {
          this.files = response.data.data.getFiles;
        });
      },
      fileClick(file) {
        if (file.type === 'DIRECTORY') {
          this.path.push(file.name);
        }
      },
      click(event) {
        this.menu.top = `${event.clientY}px`;
        this.menu.left = `${event.clientX}px`;
        setTimeout(this.$refs.menu.open, 50);
      },
      closeDialog(state) {
        if (state !== 'ok') return;
        const input = {
          op: this.dialog.op,
          path: this.path.join('/'),
          source: this.dialog.value,
        };
        if (input.op === 'RENAME') {
          input.source = this.dialog.file;
          input.target = this.dialog.value;
        } else if (input.op === 'MOVE') {
          input.source = this.dialog.file;
          input.target = this.dialog.path.join('/');
        }
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: 'mutation OperateFile($input: opFile){operateFile(data:$input){type name}}',
            variables: { input },
          },
        }).then((response) => {
          this.files = response.data.data.operateFile;
        });
      },
      moveFile(file) {
        this.dialog = {
          op: 'MOVE',
          okText: 'Move',
          path: this.path.concat(),
          file: file.name,
          value: '',
        };
        this.$refs.selDirDialog.open();
      },
      renameFile(file) {
        this.dialog = {
          op: 'RENAME',
          title: 'Rename',
          placeholder: 'Name',
          okText: 'Rename',
          value: file.name,
          file: file.name,
        };
        this.$refs.dialog.open();
      },
      removeFile(file) {
        this.dialog = {
          op: 'REMOVE',
          value: file.name,
        };
        this.closeDialog('ok');
      },
      openNewDir() {
        this.dialog = {
          op: 'MKDIR',
          title: 'New Directory',
          placeholder: 'DirectoryName',
          okText: 'Create',
          value: '',
          file: undefined,
        };
        this.$refs.dialog.open();
      },
      dropFile(event) {
        this.drag = false;
        const formData = new FormData();
        formData.append('path', this.path.join('/'));
        const files = event.dataTransfer.files;
        for (let i = 0; i < files.length; i += 1) {
          formData.append('files', files[i]);
        }
        this.$http({
          method: 'post',
          url: '/api/upload',
          data: formData,
        }).then(this.getFiles);
      },
      uploadFile() {
        const element = document.createElement('input');
        element.type = 'file';
        element.addEventListener('change', () => {
          this.dropFile({
            dataTransfer: {
              files: element.files,
            },
          });
        }, false);
        element.click();
      },
      backPath() {
        this.path.pop();
      },
      movePath(index) {
        if (this.path.length !== index + 1) {
          this.path = this.path.slice(0, index + 1);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';
  @import "variables";

  .md-menu {
    position: absolute;
  }

  .select-mode {
    height: 100%;
  }

  .empty-wrapper {
    @include emptyWrapper;
  }

  .empty > .newDir {
    margin-top: 10px;
  }

  .files-wrapper {
    width: 100%;
    height: calc(100% - 48px);

    .files {
      display: flex;
      flex-wrap: wrap;

      .file {
        margin: 10px;
      }
    }
  }

  .drag {
    z-index: 3;
    width: 100%;
    height: 100%;
    position: fixed;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 1);
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 3rem;
  }
</style>
