<template>
  <div class="select-mode">
    <div class="empty">
      <md-icon>library_books</md-icon>
      <div>Add your first photo</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'select-mode',
    title: 'SelectMode',
    mounted() {
      if (window.innerWidth > 480) this.$store.state.viewFilter = 'all';
    },
  };
</script>

<style lang="scss" scoped>
  @import 'general';

  .select-mode {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .empty {
    @include empty;
  }
</style>
