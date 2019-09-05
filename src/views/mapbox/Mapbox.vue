<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-30 09:02:58
 * @LastEditTime: 2019-09-05 11:15:29
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div>
    <p>{{areaname}}</p>
    <el-tabs class="miniMap" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="鹰眼图" name="first">
        <OverviewMap
          style="height:400px"
          :areacode="areacode"
          :FeatureCollection="FeatureCollection"
          v-on:flyto="mapFlyToEvent"
        ></OverviewMap>
      </el-tab-pane>
      <el-tab-pane label="区划选择" name="second">
        <RegionalTree :areacode="areacode" v-on:flyto="mapFlyToEvent"></RegionalTree>
      </el-tab-pane>
    </el-tabs>

    <div :id="mapId" class="mapcontainer"></div>
  </div>
</template>
<script>
//定义配置对象
const mapConfig = {
  areacode: "440305",
  areaname: "南山区",
  center: "113.923,22.546",
  mapCRS: {
    topTileExtent: [-180, -270, 180, 90],
    coordtransform: "none",
    resolutions: []
  },
  source: {
    type: "raster",
    tiles: [
      "http://192.168.1.252:6080/arcgis/rest/services/NSKSJ/DLG_ZQ_NS_SS_1031/MapServer/tile/{z}/{y}/{x}"
    ],
    zoomOffset: 10, // wmts Capabilities信息中TileMatrix第一个对应的实际多少级
    tileSize: 256
  },
  units: "degrees",
  ldHeight: 3
};
import OverviewMap from "../../components/OverviewMap.vue";
import RegionalTree from "../../components/RegionalTree.vue";
import cubeService from "../../service/cubeService";
import { mapMutations } from "vuex";

export default {
  components: {
    OverviewMap,
    RegionalTree
  },
  data() {
    return {
      map: null, //全局map对象
      areacode: mapConfig.areacode, //赋值成全局变量
      areaname: mapConfig.areaname,
      parentcode: "4403",
      FeatureCollection: {
        type: "FeatureCollection",
        features: []
      },
      activeName: "second" //鹰眼图与区划切换
    };
  },
  props: {
    mapId: {
      type: String,
      default: "map"
    }
  },
  created() {},
  mounted() {
    this.initMap();
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    /**
     * @description: 初始化底图
     * @param {type}
     * @return:
     */
    initMap() {
      let vm = this;
      vm.map = new GeoGlobe.Map({
        mapCRS: mapConfig.mapCRS,
        style: {
          version: 8,
          sources: {
            //背景source
            bd: mapConfig.source
          },
          layers: [
            //底图图层
            {
              id: "base_layer",
              type: "raster",
              source: "bd",
              "raster-opacity": 1
            }
          ]
        }, //mapConfig.style,
        container: vm.mapId,
        units: mapConfig.units, //可以不需要设置
        minZoom: 10,
        maxZoom: 24,
        center: [113.923, 22.546],
        zoom: 11,
        pitch: 0, //房屋、法人专题页面才倾斜
        bearing: 0,
        epsg: "EPSG:4490",
        doubleClickZoom: false,
        isIntScrollZoom: false, //缩放级别是否为整数处理模式
        renderWorldCopies: false,
        isAttributionControl: false,
        is3Dpitching: false, //!!(window.build || window.LegalPerson), //房屋、法人专题页面到指定层级自动倾斜
        pitch3Dzoom: 16 //自动倾斜的层级
      });
      this.addMapEventListene();
    },
    /**
     * @description: 给Map添加一些数据源和图层
     * @param {type}
     * @return:
     */
    addMapSourcesAndLayers() {
      let vm = this;
      //添加边界soucre
      if (vm.map.getSource("bianjie") == undefined) {
        vm.map.addSource("bianjie", {
          type: "geojson",
          data: {
            features: [],
            type: "FeatureCollection"
          }
        });
      }
      //添加楼栋soucre
      if (vm.map.getSource("loudon") == undefined) {
        vm.map.addSource("loudon", {
          type: "geojson",
          data: {
            features: [],
            type: "FeatureCollection"
          }
        });
      }
      //边界图层
      if (vm.map.getLayer("bianjie_layer") == undefined) {
        vm.map.addLayer({
          id: "bianjie_layer",
          type: "line",
          source: "bianjie",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": [
              "case",
              ["boolean", ["get", "color"], false],
              "#FFFF00",
              "#00FF00"
            ],
            "line-width": 4
          }
        });
      }
      //边界的高亮图层
      if (vm.map.getLayer("bianjie-highlighted_layer") == undefined) {
        vm.map.addLayer({
          id: "bianjie-highlighted_layer",
          type: "line",
          source: "bianjie",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#FFFF00",
            "line-width": 4
          },
          filter: ["==", "areacode", ""]
        });
      }
      //楼栋图层
      if (vm.map.getLayer("loudon_layer") == undefined) {
        vm.map.addLayer({
          id: "loudon_layer",
          type: "fill-extrusion",
          source: "loudon",
          minzoom: 16,
          layout: {
            visibility: "visible"
          },
          paint: {
            "fill-extrusion-opacity": 1,
            "fill-extrusion-color": [
              "match",
              ["get", "type"],
              "5",
              "#00FF00",
              "4",
              "red",
              "#aaa"
            ],
            "fill-extrusion-translate": [2, 2],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              16,
              0,
              16.05,
              ["get", "height"]
            ],

            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              16,
              0,
              16.05,
              ["get", "min_height"]
            ]
          }
        });
      }
    },
    /**
     * @description: 给Map添加一些监听事件
     * @param {type}
     * @return:
     */
    addMapEventListene() {
      let vm = this;
      //添加地图自带的Control。-----需要提取成单独的函数。
      var nav = new mapboxgl.NavigationControl();
      vm.map.addControl(nav, "bottom-right");
      vm.map.on("load", () => {
        //在地图加载完之后加载所要添加的图层和数据源
        vm.addMapSourcesAndLayers();
        //区划查询区划面信息
        vm.drawLayerByAreacode(mapConfig.areacode, false);
      });
      vm.map.on("moveend", () => {
        //触发视图的中心点事件
        vm.changeMapLocationEvent();
        //当地图层级大于16级才去请求可视范围内的楼栋数据
        if (vm.map.getZoom() > 16) {
          let coordinates = vm.getMapBounds();
          cubeService
            .getAreaInfoByCoordinates(JSON.stringify(coordinates))
            .then(res => {
              console.log(res);
              let FeatureCollection = vm.convertFeatureCollection(
                res.data.data.list,
                false
              );
              //获取map的sources
              console.log(vm.map.getSource("loudon"));
              vm.map.getSource("loudon").setData(FeatureCollection);
            });
        }
      });
      //定义楼栋图层的popup
      let louDonPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "my-class"
      });
      vm.map.on("mousemove", "loudon_layer", function(e) {
        console.log(e);
        //设置鼠标样式
        vm.map.getCanvas().style.cursor = "pointer";
        let coordinates = e.lngLat;
        let description = e.features[0].properties.areaname;
        louDonPopup
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(vm.map);
      });
      vm.map.on("mouseleave", "loudon_layer", function() {
        //还原鼠标样式
        vm.map.getCanvas().style.cursor = "grab";
        louDonPopup.remove();
      });
    },
    /**
     * @description: map的飞行事件
     * @param {type}
     * @return:
     */
    mapFlyToEvent(location, zoom) {
      let flyObj = {
        center: location,
        zoom: zoom
      };
      if (zoom == undefined) {
        delete flyObj.zoom;
      }
      this.map.flyTo(flyObj);
    },
    /**
     * @description: 改变视图的中心点事件
     * @param {type}
     * @return:
     */
    changeMapLocationEvent() {
      let vm = this;
      //获取地图视图移动之后的层级
      let zoom = vm.map.getZoom();
      //获取地图视图移动之后的中心点坐标
      let center = vm.map.getCenter();
      let point = [center.lng, center.lat];
      // console.log(zoom, center);
      let paramType;
      if (zoom < 12) {
        // 小地图展示全市地图，获取区的信息
        paramType = "1";
      } else if (zoom >= 12 && zoom < 15) {
        // 小地图展示区级地图，获取街道的信息
        paramType = "2";
      } else if (zoom >= 15 && zoom < 17) {
        // 小地图展示街道地图，获取社区的信息
        paramType = "3";
      } else if (zoom >= 17) {
        // 小地图展示社区地图，获取网格的信息
        paramType = "4";
      }

      // 区  11  街道12  社区15  网格17

      cubeService
        .getAreaInfoByPoint(JSON.stringify(point), paramType)
        .then(res => {
          console.log(res);
          vm.onAreaInfoReceived(res.data);
        });
    },
    /**
     * @description: 改变后的区划信息的数据后执行的方法
     * @param {type}
     * @return:
     */
    onAreaInfoReceived(data) {
      let vm = this;
      let resParentcode;
      // 先判断是否获取到数据
      if (data.success != true) {
        console.error("根据坐标查询数据失败");
        return;
      }
      //给全局变量赋值
      vm.areacode = data.data.areacode;
      //提交至vuex中
      vm.$store.commit("changeAreaCode", data.data.areacode);
      vm.areaname = data.data.areaname;

      //当parentcode为undefined时,则绘制当前区划
      resParentcode = data.data.parentcode;
      if (resParentcode == undefined) {
        vm.drawLayerByAreacode(vm.areacode, false);
        vm.parentcode = resParentcode;
      }
      // 行政父区划发生改变才需要重新请求数据
      else if (resParentcode !== vm.parentcode) {
        vm.parentcode = resParentcode;
        //绘制父查子的区划
        vm.drawLayerByAreacode(vm.parentcode, true);
      }
      //高亮当前区划
      vm.map.setFilter("bianjie-highlighted_layer", [
        "==",
        "areacode",
        vm.areacode
      ]);
      // vm.highLightBianjie(code);
    },
    /**
     * @description: 高亮当前区划=====》会存在显示不全的问题，必须用两个图层来渲染。
     * @param {type}
     * @return:
     */
    highLightBianjie(code) {
      //现在的mapbox gl内核不支持
      //this.map.setFeatureState({source: 'bianjie', id: code}, { color: true});
      this.map.setPaintProperty("bianjie_layer", "line-color", [
        "match",
        ["get", "areacode"],
        code,
        "#FFFF00",
        "#00FF00"
      ]);
    },
    /**
     * @description: 绘制图层
     * @param {areacode}   区划编码
     * @param {queryType} default为true 绘制父查子图层
     * @return:
     */
    drawLayerByAreacode(areacode, queryType = true) {
      let vm = this;
      cubeService.getAreaInfoByAreaCode(areacode, queryType).then(res => {
        console.log(res);
        //2种情况
        vm.FeatureCollection = vm.convertFeatureCollection(
          queryType ? res.data.data.chirdAreaInfo : res.data.data.list,
          queryType
        );
        vm.map.getSource("bianjie").setData(vm.FeatureCollection);
      });
    },
    /**
     * @description: 多面构建FeatureCollection对象
     * @param {type}
     * @return:
     */
    convertFeatureCollection(list, type = true) {
      let FeatureCollection = {
        type: "FeatureCollection",
        features: []
      };
      //判断数组
      if (list == undefined || list.length == 0) {
        console.log("请检查传入的list是否为空");
        return FeatureCollection;
      }
      //2种情况数据处理
      for (let i in list) {
        let areaname;
        if (!type) {
          if (list[i].areaname != " ") {
            areaname = list[i].areaname;
          } else {
            areaname = "暂无数据";
          }
        } else {
          areaname = list[i]._source.areaname;
        }
        FeatureCollection.features.push({
          type: "Feature",
          properties: {
            areaname: areaname,
            type: i,
            height: Math.round(Math.random() * 100 + 10),
            min_height: 0,
            areacode: type ? list[i]._source.areacode : list[i].areacode,
            color: false,
            location: type
              ? list[i]._source.location.coordinates
              : list[i].location.coordinates
          },
          geometry: type ? list[i]._source.areainfo : list[i].areainfo
        });
      }
      return FeatureCollection;
    },
    /**
     * @description: 获取当前可视范围(对角线左上角坐标和右下角坐标)几何信息。
     * @return: ArrayList[]  LineString
     */
    getMapBounds() {
      var _nw = this.map.unproject([0, 0]);
      var _ne = this.map.unproject([this.map.transform.width, 0]);
      var _sw = this.map.unproject([0, this.map.transform.height]);
      var _se = this.map.unproject([
        this.map.transform.width,
        this.map.transform.height
      ]);
      return [
        [
          Math.min(_nw.lng, _ne.lng, _sw.lng, _se.lng) / 1,
          Math.max(_nw.lat, _ne.lat, _sw.lat, _se.lat) / 1
        ],
        [
          Math.max(_nw.lng, _ne.lng, _sw.lng, _se.lng) / 1,
          Math.min(_nw.lat, _ne.lat, _sw.lat, _se.lat) / 1
        ]
      ];
    }
  }
};
</script>
<style lang="less" scoped>
.miniMap {
  position: absolute;
  width: 400px;
  height: 400px;
  z-index: 100;
}

.mapcontainer {
  width: 100vw;
  height: 80vh;
}

.my-class {
  background-color: aqua;
  width: 100px;
}
</style>
