<template>
  <div class="setting">
    <router-link tag="md-button" to="/view" class="md-raised back">
      <md-icon>arrow_back</md-icon>
      {{ $t('setting.back') }}
    </router-link>

    <div class="holder username">
      <md-input-container>
        <label>{{ $t('username') }}</label>
        <md-input disabled v-model="user.username"/>
      </md-input-container>
    </div>

    <div class="holder password">
      <md-input-container>
        <label>{{ $t('password') }}</label>
        <md-input disabled v-model='user.password'/>
      </md-input-container>
      <md-button class="md-raised" @click="openChangeDialog">
        <md-icon>build</md-icon>
        {{ $t('setting.change') }}
      </md-button>
    </div>

    <div class="holder twitter">
      <md-input-container>
        <label>TwitterID</label>
        <md-input disabled v-model="user.twitterId"/>
      </md-input-container>
      <md-button class="md-raised" @click="clickAuth('twitter')">
        <div class="stack-icon" v-if="user.twitterId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.twitterId ? $t('setting.unlink') : $t('setting.link') }}
      </md-button>
    </div>

    <div class="holder facebook">
      <md-input-container>
        <label>FacebookID</label>
        <md-input disabled v-model="user.facebookId"/>
      </md-input-container>
      <md-button class="md-raised" @click="clickAuth('facebook')">
        <div class="stack-icon" v-if="user.facebookId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.facebookId ? $t('setting.unlink') : $t('setting.link') }}
      </md-button>
    </div>

    <div class="holder instagram">
      <md-input-container>
        <label>InstagramID</label>
        <md-input disabled v-model="user.instagramId"/>
      </md-input-container>
      <md-button class="md-raised" @click="clickAuth('instagram')">
        <div class="stack-icon" v-if="user.instagramId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.instagramId ? $t('setting.unlink') : $t('setting.link') }}
      </md-button>
    </div>

    <md-dialog ref="changeDialog">
      <md-dialog-title>{{ $t('setting.passwd.title') }}</md-dialog-title>

      <md-dialog-content>
        <md-input-container>
          <label>{{ $t('setting.passwd.old') }}</label>
          <md-input type="password" v-model="dialog.oldPassword"/>
        </md-input-container>
        <md-input-container>
          <label>{{ $t('setting.passwd.new') }}</label>
          <md-input type="password" v-model="dialog.newPassword"/>
        </md-input-container>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="closeChangeDialog('cancel')">Cancel</md-button>
        <md-button class="md-primary" @click="closeChangeDialog('ok')">Change</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import sha256 from 'js-sha256';

  export default {
    name: 'setting',
    data() {
      return {
        user: {},
        dialog: {
          oldPassword: '',
          newPassword: '',
        },
      };
    },
    mounted() {
      this.$http({
        method: 'post',
        url: '/api',
        data: {
          query: 'query{user{username password twitterId facebookId instagramId}}',
        },
      }).then((response) => {
        this.user = response.data.data.user;
      });
    },
    methods: {
      openChangeDialog() {
        this.$refs.changeDialog.open();
      },
      closeChangeDialog(state) {
        this.$refs.changeDialog.close();
        if (state !== 'ok') return;
        if (this.dialog.oldPassword && this.dialog.newPassword) {
          let oldPass = this.dialog.oldPassword;
          let newPass = this.dialog.newPassword;
          for (let i = 0; i < CommonConfig.auth.local.stretch; i += 1) {
            oldPass = sha256(oldPass);
            newPass = sha256(newPass);
          }
          this.updateUser({
            oldPassword: oldPass,
            newPassword: newPass,
          });
        }
      },
      clickAuth(service) {
        if (this.user[`${service}Id`]) {
          this.updateUser({
            [`${service}Id`]: true,
          });
        } else if (window.location.protocol === 'http:' || service === 'instagram') {
          window.location.href = `/api/auth/${service}`;
        } else {
          this.$http.get(`/api/auth/${service}`).catch((error) => {
            this.$snotify.error('', `${error.response.status}`);
          });
        }
      },
      updateUser(input) {
        let data = '{';
        Object.keys(input).forEach((key) => {
          data += `${key}:"${input[key]}",`;
        });
        this.$http({
          method: 'post',
          url: '/api',
          data: {
            query: `mutation{setUser(data:${data}}){username password twitterId facebookId instagramId}}`,
          },
        }).then((response) => {
          this.user = response.data.data.setUser;
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .setting {
    padding: 20px;
  }

  .back {
    margin-bottom: 10px;
  }

  .holder {
    display: flex;

    .md-button {
      width: 100%;
      max-width: 120px;
      max-height: 36px;
    }

    .stack-icon {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 1;

      .md-icon {
        position: absolute;
        color: lightgray;
      }

      .md-icon + .md-icon {
        position: relative;
      }

      .md-icon:last-child {
        color: black;
      }
    }
  }

  @media all and (max-width: 500px) {
    .holder {
      .md-button {
        max-width: 80px;

        & > .md-icon {
          display: none;
        }

        & > .stack-icon {
          display: none;
        }
      }
    }
  }

  @media all and (max-width: 350px) {
    .holder {
      .md-button {
        font-size: 0;
        min-width: 36px;
        width: 36px;
        padding: 0;

        & > .md-icon {
          display: inline-block;
        }

        & > .stack-icon {
          display: inline-block;
        }
      }
    }
  }
</style>
