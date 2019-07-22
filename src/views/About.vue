<template>
  <div class="about">
    <h1>This is an about page</h1>
    <BaseMap></BaseMap>
  </div>
</template>

<script>
import BaseMap from "../components/BaseMap.vue";
export default {
  name: "about",
  components: {
    BaseMap
  }
};
</script>
<style lang="less" scoped>
h1{
  text-align: center;
}
</style>

