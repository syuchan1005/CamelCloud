<template>
  <div class="hello">
    <div class="title">PicStorage</div>
    <div class="sub-title">= picture + storage</div>
    <div class="form">
      <md-input-container>
        <label>ID</label>
        <md-input type="text" v-model="user.id" ref="id-input"/>
      </md-input-container>
      <md-input-container md-has-password>
        <label>Password</label>
        <md-input type="password" v-model="user.pass" @keyup.native.enter="downEnter"/>
      </md-input-container>
      <md-button class="md-primary" @click="clickLogin" ref="loginButton">Login</md-button>
    </div>

    <md-menu md-size="4" md-direction="top right" ref="menu">
      <md-button class="footer" md-menu-trigger>
        Created by syu_chan_1005
      </md-button>

      <md-menu-content>
        <div class="author-card">
          <md-avatar class="md-large">
            <img src="https://github.com/syuchan1005.png" alt="syu_chan_1005">
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
  export default {
    name: 'hello',
    title: 'Hello',
    data() {
      return {
        user: {
          id: '',
          pass: '',
        },
      };
    },
    methods: {
      downEnter() {
        const button = this.$refs.loginButton.$el;
        button.click();
        button.focus();
      },
      clickLogin() {
        this.$refs['id-input'].$el.focus();
        this.user.pass = '';
        this.$snotify.error('Invalid ID or Password.', 'Login Failed');
      },
    },
  };
</script>

<style scoped lang="scss">
  .hello {
    width: 100%;
    height: 100%;
    color: white;
    background: linear-gradient(#1D77EF, #83F3FE);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .title {
    font-size: 3rem;
    line-height: normal;
  }

  .sub-title {
    font-size: 1.2rem;
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
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 5px 8px rgba(0,0,0,.14), 0 1px 14px rgba(0,0,0,.12);

    & > .md-button {
      float: right;
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
