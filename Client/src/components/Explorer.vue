<template>
  <div class="select-mode" @dragover.prevent="drag = $event.dataTransfer.items.length !== 0">
    <path-bar v-if="$store.state.viewFilter === 'NORMAL'"
              v-model="path" :icon="separator.icon" :separator="separator.value"
              @clickBack="backPath" @clickUploadFile="uploadFile" @clickNewFolder="openNewDir"
              @clickPath="movePath" @clickReload="getFiles"/>
    <path-bar v-if="$store.state.viewFilter === 'TRASH'"
              v-model="path" :icon="separator.icon" :separator="separator.value"
              @clickBack="backPath" @clickPath="movePath" @clickEmpty="openConfirmEmptyDialog" @clickReload="getFiles"/>

    <div class="empty-wrapper" v-if="!files.length">
      <div class="empty" @click="uploadFile" v-if="viewFilter === 'NORMAL'">
        <md-icon>library_books</md-icon>
        <div class="title">{{ $t('explorer.add') }}</div>

        <md-button class="md-raised newDir" @click.stop="openNewDir">
          <md-icon>add</md-icon>
          {{ $t('explorer.createDirBtn') }}
        </md-button>
      </div>
      <div class="empty" v-if="viewFilter === 'TRASH'">
        <md-icon>delete_sweep</md-icon>
        <div class="title">{{ $t('explorer.empty') }}</div>
      </div>
    </div>

    <vue-perfect-scrollbar v-if="files.length" class="files-wrapper" @contextmenu.native.prevent="click($event)">
      <div class="files">
        <file v-if="$store.state.viewFilter === 'NORMAL'" v-for="(file, index) in files" :key="index" :name="file.name"
              :type="file.type" :thumbnail-url="file.thumbnailUrl"
              :download-text="$t('explorer.file.downloadText')" :move-text="$t('explorer.file.moveText')"
              :rename-text="$t('explorer.file.renameText')" :remove-text="$t('explorer.file.removeText')"
              @click="fileClick(file)" @move="moveFile(file)" @remove="removeFile(file)" @rename="renameFile(file)"
              @download="downloadFile(file)" @drop="dropDir($event, file)" @dragstart="dragFile = file" />
        <file v-if="$store.state.viewFilter === 'TRASH'" v-for="(file, index) in files" :key="index" :name="file.name"
              :type="file.type" :thumbnail-url="file.thumbnailUrl"
              @download="downloadFile(file)" @click="fileClick(file)" @move="moveFile(file)" @remove="removeFile(file)"
              remove-icon="delete_forever" :remove-text="$t('explorer.file.deleteText')"
              :move-text="$t('explorer.file.restoreText')" :download-text="$t('explorer.file.downloadText')" />
      </div>
    </vue-perfect-scrollbar>

    <md-menu md-size="4" ref="menu" :style="menu">
      <!--suppress HtmlUnknownAttribute -->
      <div md-menu-trigger></div>

      <md-menu-content>
        <md-menu-item @click="openNewDir">
          <md-icon>add</md-icon>
          <span>{{ $t('explorer.popup.createDir') }}</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>

    <!--suppress RequiredAttributes -->
    <md-dialog-prompt :md-title="dialog.title" :md-input-placeholder="dialog.placeholder"
                      :md-ok-text="dialog.okText" :md-cancel-text="$t('explorer.dialog.cancelText')" @close="closeDialog" v-model="dialog.value" ref="dialog"/>

    <select-directory-dialog v-model="dialog.path" @close="closeDialog"
                             :path-icon="separator.icon" :path-separator="separator.value"
                             :title="$t('explorer.dialog.selectDir.title')" :ok-text="$t('explorer.dialog.selectDir.okText')"
                             :cancel-text="$t('explorer.dialog.cancelText')"
                             ref="selDirDialog"/>

    <md-dialog-confirm :md-title="$t('explorer.dialog.emptyTrash.title')" :md-content="$t('explorer.dialog.emptyTrash.content')"
                       :md-ok-text="$t('explorer.dialog.emptyTrash.okText')" :md-cancel-text="$t('explorer.dialog.cancelText')"
                       @close="emptyTrash" ref="confirmEmptyDialog"/>

    <div class="drag" v-if="drag" @dragleave.prevent="drag = false" @drop.prevent="dropFile($event)"
         @dragover.stop.prevent="$event.dataTransfer.dropEffect = 'copy'">
      <div class="border">{{ $t('explorer.dropUpload') }}</div>
    </div>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar';
  import { mapGetters } from 'vuex';
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
        separator: {
          icon: CommonConfig.separator.icon,
          value: CommonConfig.separator.value,
        },
        dragFile: undefined,
      };
    },
    computed: {
      ...mapGetters({
        viewFilter: 'getViewFilter',
      }),
    },
    mounted() {
      if (!this.under480 && !this.viewFilter) {
        this.$store.commit('viewFilter', 'NORMAL');
      } else {
        this.getFiles();
      }
    },
    watch: {
      files(newFiles) {
        return newFiles.map((file) => {
          if (file.thumb) {
            // eslint-disable-next-line
            file.thumbnailUrl = `/api/file?path=${this.path.join('/')}/${file.name}${this.viewFilter === 'TRASH' ? '&folder=TRASH' : ''}`;
          }
          return file;
        });
      },
      path() {
        this.getFiles();
      },
      viewFilter() {
        this.path = [];
      },
    },
    methods: {
      getFiles() {
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `query{files(path:"/${this.path.join('/')}"${this.viewFilter === 'TRASH' ? ' folderType:TRASH' : ''}){name type thumb}}`,
          },
        }).then((response) => {
          this.files = response.data.data.files;
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
        let input = `{op:${this.dialog.op},path:"${this.path.join('/')}"`;
        if (this.dialog.op === 'RENAME') {
          input += `,source:"${this.dialog.file}",target:"${this.dialog.value}"`;
        } else if (this.dialog.op === 'MOVE') {
          input += `,source:"${this.dialog.file}",target:"${this.dialog.path.join('/')}"`;
          if (this.viewFilter === 'TRASH') input += ',sourceFolder:TRASH';
        } else {
          input += `,source:"${this.dialog.value}"`;
        }
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `mutation{operateFile(data:${input}}){type name thumb}}`,
          },
        }).then((response) => {
          this.files = response.data.data.operateFile;
        });
      },
      moveFile(file) {
        this.dialog = {
          op: 'MOVE',
          okText: this.$t('explorer.dialog.move.okText'),
          path: this.path.concat(),
          file: file.name,
          value: '',
        };
        this.$refs.selDirDialog.open();
      },
      renameFile(file) {
        this.dialog = {
          op: 'RENAME',
          title: this.$t('explorer.dialog.rename.title'),
          placeholder: this.$t('explorer.dialog.rename.placeholder'),
          okText: this.$t('explorer.dialog.rename.okText'),
          value: file.name,
          file: file.name,
        };
        this.$refs.dialog.open();
      },
      removeFile(file) {
        this.dialog = {
          op: this.viewFilter === 'TRASH' ? 'DELETE' : 'REMOVE',
          value: file.name,
        };
        this.closeDialog('ok');
      },
      openNewDir() {
        this.dialog = {
          op: 'MKDIR',
          title: this.$t('explorer.dialog.mkdir.title'),
          placeholder: this.$t('explorer.dialog.mkdir.placeholder'),
          okText: this.$t('explorer.dialog.mkdir.okText'),
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
      downloadFile(file) {
        if (file.type === 'DIRECTORY') {
          this.$snotify.warning('Not Implements', 'Directory Download');
        } else {
          this.$http({
            method: 'get',
            url: `/api/file?type=RAW&path=${this.path.join('/')}/${file.name}${this.$store.state.viewFilter === 'TRASH' ? '&folder=TRASH' : ''}`,
            responseType: 'blob',
          }).then((response) => {
            const a = document.createElement('a');
            a.download = file.name;
            a.href = window.URL.createObjectURL(response.data);
            a.click();
          });
        }
      },
      openConfirmEmptyDialog() {
        this.$refs.confirmEmptyDialog.open();
      },
      emptyTrash(state) {
        if (state !== 'ok') return;
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: 'mutation{emptyTrash{type name thumb}}',
          },
        }).then((response) => {
          this.files = response.data.data.emptyTrash;
        });
      },
      dropDir(event, file) {
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `mutation{operateFile(data:{op:MOVE,path:"${this.path.join('/')}",source:"${this.dragFile.name}",target:"${this.path.join('/')}/${file.name}"}){type name thumb}}`,
          },
        }).then((response) => {
          this.files = response.data.data.operateFile;
        });
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
    background-color: rgba(0, 0, 0, 0.1);

    .border {
      width: 97%;
      height: 97%;
      color: rgba(0, 0, 0, 0.8);
      font-size: 3rem;
      border: 6px #ddd dashed;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }
  }
</style>
