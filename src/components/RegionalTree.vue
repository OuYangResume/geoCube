<!--
 * @Description: 区划组件与地图联动
 * @Author: oouyang
 * @Date: 2019-09-03 09:10:20
 * @LastEditTime: 2019-09-05 10:56:23
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div>
    <p>{{name}}+{{count}}</p>
    <transition name="fade">
      <div class="tree" id="tree">
        <div>
          <ul v-for="(item,index) in popList" :key="index.areacode">
            <li @click="_getItemList(item)">
              <p style="color:red">{{item.areaname}}</p>
            </li>
          </ul>
        </div>
        <div>
          <ul v-for="(nodeItem,nodeIndex) in treeList" :key="nodeIndex">
            <li @click="_getItemList(nodeItem)">
              <div style="color:green;">{{nodeItem.areaname}}</div>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import cubeService from "../service/cubeService";
import { mapState } from "vuex";
export default {
  data() {
    return {
      name: "树形组件",
      treeList: [], //核心数组
      popList: [], //导航栏数组
      cubeObj: {}
    };
  },
  props: {
    // areacode: {
    //   type: String,
    //   required: true
    // }
  },
  computed: mapState({
    count: state => state.areacode,
    countAlias: "count" // 别名 `count` 等价于 state => state.count
  }),
  watch: {
    //监听areacode的变化
    count: function(val) {
      console.log(val, "监听areacode的变化");

      let code;
      //当areacode到达网格层级时。需要特殊处理
      if (val.length >= 15) {
        //截取字符串，取父code
        code = val.substr(0, 12);
      } else {
        code = val;
      }
      //更新区划列表数据
      this.getChildList(code).then(res => {
        this.treeList = res.data;
      });
      //更新导航栏数据
      this.getFatherObj(val).then(res => {
        this.cubeObj = res;
        this.popList = this.convertList(res);
      });
    }
  },
  mounted() {
    let areacode = "440305";
    this.getChildList(areacode).then(res => {
      this.treeList = res.data;
    });
    this.getFatherObj(areacode).then(res => {
      this.cubeObj = res;
      this.popList = this.convertList(res);
    });
  },
  methods: {
    /**
     * @description: 构造导航栏数据
     * @param {type}
     * @return:
     */
    convertList(cubeObj) {
      let list = [];
      //过滤数据为"0",也就是数据为空
      for (let i in cubeObj) {
        if (cubeObj[i] === "0") {
          delete cubeObj[i];
        }
      }
      //构造导航栏需要的数组
      let quhuaList = ["qu", "jd", "sq", "wg"];
      for (let j of quhuaList) {
        if (cubeObj[j + "dm"] != undefined) {
          let obj = {
            areacode: "",
            areaname: "",
            lon: "",
            lat: ""
          };
          obj.areacode = cubeObj[j + "dm"];
          obj.areaname = cubeObj[j + "mc"];
          obj.lon = cubeObj[j + "lon"];
          obj.lat = cubeObj[j + "lat"];
          list.push(obj);
        }
      }
      return list;
    },
    /**
     * @description: 回调事件
     * @param {type}
     * @return:
     */
    flyto(location, areacode) {
      var zoom;
      switch (areacode.length) {
        case 6:
          zoom = 11; //区级
          break;
        case 9:
          zoom = 13; //街道
          break;
        case 12:
          zoom = 15; //社区
          break;
        case 15: //网格
          zoom = 17;
      }
      if (zoom != undefined) {
        this.$emit("flyto", location, zoom);
      }
    },
    /**
     * @description: 列表的点击事件与code变化时触发的事件
     * @param {type}
     * @return:
     */
    _getItemList(item) {
      let vm = this;
      let areacode = item.areacode;
      let location = [item.lon, item.lat];
      vm.flyto(location, areacode);
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
        .getCubeInfoByAreaCode(areacode, queryType)
        .then(res => {
          if (res.data.success && res.data.retCode === "00000") {
            let list = res.data.data;
            return Promise.resolve(list);
          } else {
            console.error("父code查询子区划信息,并构造核心数组数据");
          }
        });
    },
    /**
     * @description: code查询八级区划信息,用于构造导航栏数组
     * @param {type}
     * @return:
     */
    getFatherObj(areacode) {
      let vm = this;
      let queryType = false;
      return cubeService
        .getCubeInfoByAreaCode(areacode, queryType)
        .then(res => {
          if (res.data.success && res.data.retCode === "00000") {
            let obj = res.data.data;
            return Promise.resolve(obj);
          } else {
            console.error("code查询八级区划信息,并构造核心数组数据");
          }
        });
    }
  }
};
</script>