<template>
  <div class="select-mode" :class="{ empty: !files.length}" @dragover.prevent="drag = true">
    <div class="empty" v-if="!files.length" @click="uploadFile">
      <md-icon>library_books</md-icon>
      <div class="title">Add your first photo</div>

      <md-button class="md-raised newDir" @click.stop="openNewDir">
        <md-icon>add</md-icon>
        or create directory
      </md-button>
    </div>


    <div v-if="files.length" class="path">{{ path }}</div>

    <vue-perfect-scrollbar v-if="files.length" class="files" @contextmenu.native.prevent="click($event)">
      <file @click="fileClick(file)" v-for="(file, index) in files" :key="index"
            :name="file.name" :type="file.type" @rename="renameFile(file)" @remove="removeFile(file)"/>
    </vue-perfect-scrollbar>

    <md-menu md-size="4" ref="menu" :style="menu">
      <!--suppress HtmlUnknownAttribute -->
      <div md-menu-trigger></div>

      <md-menu-content>
        <md-menu-item @selected="openNewDir">
          <md-icon>add</md-icon>
          <span>Create New Folder</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>

    <md-dialog-prompt :md-title="dialog.title" :md-input-placeholder="dialog.placeholder"
                      :md-ok-text="dialog.okText" @close="closeDialog" v-model="dialog.value" ref="dialog"/>

    <div class="drag" v-if="drag" @dragleave.prevent="drag = false" @drop.prevent="dropFile($event)">
      Drop your picture
    </div>
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
          file: undefined,
        },
        drag: false,
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
      click(event) {
        this.menu.top = `${event.clientY}px`;
        this.menu.left = `${event.clientX}px`;
        setTimeout(this.$refs.menu.open, 50);
      },
      closeDialog(state) {
        if (state !== 'ok') return;
        const input = {
          op: this.dialog.op,
          path: this.path.replace(/> /g, '/'),
          source: this.dialog.value,
        };
        if (input.op === 'RENAME') {
          input.source = this.dialog.file;
          input.target = this.dialog.value;
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
        formData.append('path', this.path.replace(/> /g, '/'));
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
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';

  .md-menu {
    position: absolute;
  }

  .select-mode {
    height: 100%;
  }

  .select-mode.empty {
    @include emptyWrapper;
  }

  .empty > .newDir {
    margin-top: 10px;
  }

  .path {
    margin: 10px;
    width: calc(100% - 20px);
    height: 22px;
    border: solid 1px lightgray;
    padding: 0 5px;
    @include textEllipsis;
    @include disableSelect;
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
