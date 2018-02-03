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
  };
</script>

<style lang="scss" scoped>
  .select-mode {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .empty {
    text-align: center;

    & > .md-icon {
      width: 160px;
      height: 160px;
      font-size: 160px;
      color: rgba(0, 0, 0, 0.26);
    }

    & > div {
      font-size: 26px;
      font-weight: 500;
      line-height: 40px;
      color: rgba(0, 0, 0, 0.87);
    }
  }
</style>
