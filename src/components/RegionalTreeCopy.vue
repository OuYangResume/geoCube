<!--
 * @Description: 区划组件与地图联动 -----没用了
 * @Author: oouyang
 * @Date: 2019-09-03 09:10:20
 * @LastEditTime: 2019-09-04 15:58:45
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div>
    <p>{{name}}</p>
    <div class="tree" id="tree">
      <ul v-for="(childTree,nodeIndex) in treeList" :key="nodeIndex">
        <li v-for="item in childTree" :key="item.areacode" @click="_getItemList(item.areacode)">
          <div style="color: red">{{item.areaname}}</div>
        </li>
      </ul>
      <ul v-for="item in popList" :key="item.areacode" @click="_getItemList(item.areacode)">
        <div style="color: red">{{item.areaname}}</div>
      </ul>
    </div>
    <!-- <transition name="fade">
      <div class="tree" id="tree">
        <ul v-for="(childTree,nodeIndex) in treeList" :key="nodeIndex">
          <li v-for="item in childTree" :key="item.areacode" @click="_getItemList(item,nodeIndex)">
            <div>{{item.areaname}}</div>
          </li>
        </ul>
      </div>
    </transition>-->
  </div>
</template>

<script>
import cubeService from "../service/cubeService";
export default {
  data() {
    return {
      name: "树形组件",
      treeList: [], //核心数组
      chirdAreaList: {}
    };
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
  computed: {
    /**
     * @description: 返回核心数组的最后一个数组
     * @param {type}
     * @return:
     */
    popList: function() {
      return this.treeList[this.treeList.length - 1];
    }
  },
  watch: {
    //监听areacode的变化
    areacode: function(val) {
      console.log(val, "监听areacode的变化");
      this._getItemList(val);
    },
    FeatureCollection: function(val) {
      console.log(val, "FeatureCollection");
    }
  },
  mounted() {
    this.getChildList("440305").then(res => {
      this.treeList.push(res);
    });
  },
  methods: {
    /**
     * @description: 列表的点击事件与code变化时触发的事件
     * @param {type}
     * @return:
     */

    _getItemList(areacode) {
      let vm = this;
      //到网格层级。无需处理
    //   if (areacode.length >= 15) {
    //     return;
    //   }
      let nodeIndex;
      if (areacode.length == 6) {
        nodeIndex = 0;
      }
      if (areacode.length == 9) {
        nodeIndex = 0;
      }
      if (areacode.length == 12) {
        nodeIndex = 1;
      }
      vm.getChildList(areacode).then(list => {
        //如果核心数组里面存在，先删除，再push
        if (vm.treeList[nodeIndex + 1]) {
          let arr = vm.treeList;
          arr = arr.slice(0, nodeIndex + 1);
          vm.treeList = arr;
          vm.treeList.push(list);
        } else {
          if (list != undefined) {
            vm.treeList.push(list);
          }
        }
      });
    },
    /**
     * @description: 父code查询子区划信息,并构造核心数组数据
     * @param {type}
     * @return:
     */

    getChildList(areacode) {
      let vm = this;
      let queryType = true;
      return cubeService
        .getAreaInfoByAreaCode(areacode, queryType)
        .then(res => {
          console.log(res);
          if (res.data.success && res.data.retCode === "00000") {
            let list = vm.convertList(res.data.data);
            console.log(list);
            return Promise.resolve(list);
          }
        });
    },
    /**
     * @description: 构造数据
     * @param {type}
     * @return:
     */
    convertList(data) {
      let list = [];
      for (let i in data.chirdAreaInfo) {
        let obj = {
          areacode: "",
          areaname: "",
          location: {}
        };
        obj.areacode = data.chirdAreaInfo[i]._source.areacode;
        obj.areaname = data.chirdAreaInfo[i]._source.areaname;
        obj.location = data.chirdAreaInfo[i]._source.location;
        list.push(obj);
      }
      return list;
    }
  }
};
</script>