<template>
  <div class="hello">
    <div class="title">CamelCloud</div>
    <div class="form">
      <form>
        <md-input-container>
          <label>Username</label>
          <md-input type="text" autocomplete="username" v-model="user.username" ref="id-input"/>
        </md-input-container>
        <md-input-container md-has-password>
          <label>Password</label>
          <md-input type="password" autocomplete="password" v-model="user.pass" @keyup.native.enter="downEnter" ref="pass-input"/>
        </md-input-container>
        <md-button class="md-primary" @click="clickLogin" ref="login-button">Sign in or Sign up</md-button>
      </form>

      <div class="login-label" v-if="authList.length > 1">or sign in with</div>

      <div class="auth" v-if="authList.length > 1">
        <div v-if="authList.includes('twitter')">
          <md-button class="md-clean twitter" @click="clickAuth('twitter')">
            <icon name="twitter" scale="2.5"/>
          </md-button>
          <div>Twitter</div>
        </div>

        <div v-if="authList.includes('facebook')">
          <md-button class="md-clean facebook" @click="clickAuth('facebook')">
            <icon name="facebook" scale="2.5"/>
          </md-button>
          <div>Facebook</div>
        </div>

        <div v-if="authList.includes('instagram')">
          <md-button class="md-clean instagram" @click="clickAuth('instagram')">
            <icon name="instagram" scale="3"/>
          </md-button>
          <div>Instagram</div>
        </div>
      </div>
    </div>

    <md-menu md-size="4" md-direction="top right" ref="menu">
      <md-button class="footer" md-menu-trigger>
        Created by syu_chan_1005
      </md-button>

      <md-menu-content>
        <div class="author-card">
          <md-avatar class="md-large">
            <img src="@/assets/head.png" alt="syu_chan_1005" class="avatar">
          </md-avatar>

          <div class="author-card-info">
            <span>syu_chan_1005</span>
            <div class="author-card-links">
              <a href="https://github.com/syuchan1005" target="_blank" rel="noopener">GitHub</a>
              <a href="https://twitter.com/syu_chan_1005" target="_blank" rel="noopener">Twitter</a>
            </div>
          </div>
        </div>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
  import sha256 from 'js-sha256';

  export default {
    name: 'hello',
    title: 'Hello',
    data() {
      return {
        user: {
          username: '',
          pass: '',
        },
        authList: CommonConfig.auth.list,
      };
    },
    mounted() {
      if (this.$store.state.auth.type) {
        this.$snotify.error(`${this.$store.state.auth.type} User Not Found`, 'Login Failed');
        this.$store.commit('authType', '');
      }
      this.$store.commit('setAuth', {
        userId: undefined,
        login: false,
      });
      this.$store.commit('viewFilter', undefined);
      this.$http.get('/api/logout', {
        maxRedirects: 0,
      }).catch(() => undefined);
    },
    methods: {
      downEnter() {
        const button = this.$refs['login-button'].$el;
        button.click();
        button.focus();
      },
      clickLogin() {
        this.$store.commit('authType', 'local');
        if (this.user.username && this.user.pass) {
          let pass = this.user.pass;
          for (let i = 0; i < CommonConfig.auth.local.stretch; i += 1) {
            pass = sha256(pass);
          }
          this.$http({
            method: 'post',
            url: '/api/auth/local',
            data: {
              username: this.user.username,
              password: pass,
            },
          }).then(() => this.$router.push({ path: '/check' }))
            .catch(() => {
              this.user.pass = '';
              this.$refs['pass-input'].$el.focus();
              this.$snotify.error('Invalid ID or Password.', 'Login Failed');
            });
        } else {
          this.$refs[`${this.user.username ? 'pass' : 'id'}-input`].$el.focus();
          this.user.pass = '';
          this.$snotify.error('Invalid ID or Password.', 'Login Failed');
        }
      },
      clickAuth(service) {
        this.$store.commit('authType', service);
        if (window.location.protocol === 'http:' || service === 'instagram') {
          window.location.href = `/api/auth/${service}`;
        } else {
          this.$http.get(`/api/auth/${service}`).catch((error) => {
            this.$snotify.error('', `${error.response.status}`);
          });
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  @import 'variables';

  .hello {
    width: 100%;
    height: 100%;
    color: white;
    background: $gradientColor;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .title {
    font-size: 3rem;
    line-height: normal;
  }

  .form {
    min-width: 280px;
    width: 40vw;
    max-width: 360px;
    padding: 15px;
    margin: 20px;

    border-radius: 1%;
    border: solid 2px white;
    background-color: white;
    color: black;
    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, .2), 0 5px 8px rgba(0, 0, 0, .14), 0 1px 14px rgba(0, 0, 0, .12);

    form > .md-button {
      width: calc(100% - 15px);
    }

    & > .login-label {
      margin-bottom: 5px;
    }

    & > .auth {
      height: 90px;

      display: flex;
      align-items: center;
      flex-direction: column;
      flex-wrap: wrap;

      & > div {
        display: flex;
        flex-direction: column;
        align-items: center;

        .md-button {
          color: white !important;
          border-radius: 15% !important;
          min-width: 56px;
          width: 56px;
          min-height: 56px;
          height: 56px;
          padding: 0;

          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
        }

        .twitter {
          background: $twitterMain !important;
        }

        .facebook {
          background: $facebookMain !important;
        }

        .instagram {
          background: $instagramBack !important;

          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 5px;
    right: 5px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    text-transform: none;
  }

  .author-card {
    padding: 8px 16px;
    display: flex;
    align-items: center;

    .md-avatar {
      margin-right: 16px;

      .avatar {
        image-rendering: pixelated;
      }
    }

    .author-card-info {
      display: flex;
      flex-flow: column;
      flex: 1;
    }

    span {
      font-size: 16px;
    }

    .author-card-links {
      display: flex;

      a + a {
        margin-left: 8px;
      }
    }
  }
</style>
