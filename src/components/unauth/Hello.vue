<template>
  <div class="hello">
    <div class="title">PicStorage</div>
    <div class="sub-title">= picture + storage</div>
    <div class="form">
      <md-input-container>
        <label>ID</label>
        <md-input type="text" />
      </md-input-container>
      <md-input-container md-has-password>
        <label>Password</label>
        <md-input type="password" />
      </md-input-container>
      <md-button class="md-primary">Login</md-button>
    </div>
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
    width: 40vw;
    padding: 15px;
    margin: 20px;

    border-radius: 1%;
    border: solid 2px white;
    background-color: white;
    color: black;
    box-shadow: 4px 5px 5px -2px rgba(0, 0, 0, 0.3);

    & > .md-button {
      float: right;
    }
  }
</style>
