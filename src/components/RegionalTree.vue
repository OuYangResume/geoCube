<template>
  <div>区划选择</div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    areacode: {
      type: String,
      required: true
    },
    FeatureCollection: {
      type: Object
    }
  },
  watch: {
    //监听areacode的变化
    areacode: function(val) {
      console.log(val);
    },
    FeatureCollection: function(val) {
      console.log(val);
    }
  }
};
</script>
