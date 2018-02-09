<template>
  <div class="check">
    <div class="empty">
      <breeding-rhombus-spinner
        :animation-duration="2000"
        :size="120"
        :color="variables.mainColor"
      />
      <div class="title">Checking...</div>
    </div>
  </div>
</template>

<script>
  import variables from '!!sass-variable-loader!./_variables.scss'; // eslint-disable-line import/no-webpack-loader-syntax
  import { BreedingRhombusSpinner } from 'epic-spinners';

  export default {
    components: {
      BreedingRhombusSpinner,
    },
    name: 'check',
    data() {
      return {
        variables,
      };
    },
    mounted() {
      this.$http.get('/api/auth').then((response) => {
        this.$store.commit('setLogin', response.data);
        this.$router.push('/view');
      });
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';
  @import 'variables';
  .check {
    @include emptyWrapper();
  }

  .empty > .title {
    margin-top: 30px;
  }
</style>
