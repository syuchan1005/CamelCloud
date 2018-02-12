<template>
  <div class="setting">
    <div class="holder username">
      <md-input-container>
        <label>Username</label>
        <md-input disabled v-model="user.username"/>
      </md-input-container>
      <md-button class="md-raised">
        <md-icon>build</md-icon>
        Change
      </md-button>
    </div>

    <div class="holder password">
      <md-input-container>
        <label>Password</label>
        <md-input disabled :value='String(user.password)' />
      </md-input-container>
      <md-button class="md-raised">
        <md-icon>build</md-icon>
        Change
      </md-button>
    </div>

    <div class="holder twitter">
      <md-input-container>
        <label>TwitterID</label>
        <md-input disabled :value="user.twitterId" />
      </md-input-container>
      <md-button class="md-raised">
        <div class="stack-icon" v-if="user.twitterId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.twitterId ? 'unLink' : 'Link' }}
      </md-button>
    </div>

    <div class="holder facebook">
      <md-input-container>
        <label>FacebookID</label>
        <md-input disabled :value="user.facebookId" />
      </md-input-container>
      <md-button class="md-raised">
        <div class="stack-icon" v-if="user.facebookId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.facebookId ? 'unLink' : 'Link' }}
      </md-button>
    </div>

    <div class="holder instagram">
      <md-input-container>
        <label>InstagramID</label>
        <md-input disabled :value="user.instagramId" />
      </md-input-container>
      <md-button class="md-raised">
        <div class="stack-icon" v-if="user.instagramId">
          <md-icon>link</md-icon>
          <md-icon>clear</md-icon>
        </div>
        <md-icon v-else>link</md-icon>
        {{ user.instagramId ? 'unLink' : 'Link' }}
      </md-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'setting',
    data() {
      return {
        user: {},
      };
    },
    mounted() {
      this.$http({
        method: 'post',
        url: '/api',
        data: {
          query: `{getUser(id:${this.$store.state.auth.userId}){username password twitterId facebookId instagramId}}`,
        },
      }).then((response) => {
        this.user = response.data;
      });
    },
  };
</script>

<style lang="scss" scoped>
  .setting {
    padding: 20px;
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
