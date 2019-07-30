<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <p>测试按需引入element组件,使用element组件时先检查mian.js是否引入。</p>按钮组件:
    <el-button>默认按钮</el-button>输入框组件:
    <el-input v-model="input" placeholder="请输入内容"></el-input>
  </div>
</template>

<script>
export default {
  name: "home",
  components: {},
  data() {
    return {
      input: "输入"
    };
  }
};
</script>
