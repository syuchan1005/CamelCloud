<template>
  <div class="select-mode" :class="{ empty: !files.length}">
    <div class="empty" v-if="!files.length">
      <md-icon>library_books</md-icon>
      <div class="title">Add your first photo</div>
    </div>
    <div v-else class="path">{{ path }}</div>
    <vue-perfect-scrollbar class="files" @contextmenu.native.prevent="click($event)">
      <file @click="fileClick(file)" v-for="(file, index) in files" :key="index"
            :name="file.name" :type="file.type" @rename="renameFile(file)" @remove="removeFile(file)"/>
    </vue-perfect-scrollbar>

    <md-menu md-size="4" ref="menu" :style="menu">
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
