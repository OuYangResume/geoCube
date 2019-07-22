<template>
  <div :id="mapId" class="mapcontainer"></div>
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
import cubeService from "../service/cubeService";
export default {
  data() {
    return {
      map: null //全局map对象
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
            bd: mapConfig.source,
            //添加边界soucre
            bianjie: {
              type: "geojson",
              data: {
                features: [],
                type: "FeatureCollection"
              }
            }
          },
          layers: [
            //底图图层
            {
              id: "base_layer",
              type: "raster",
              source: "bd",
              "raster-opacity": 1
            },
            //边界图层
            {
              id: "bianjie_layer",
              type: "line",
              source: "bianjie",
              // layout: {
              //   visibility: "visible"
              // },
              // paint: {
              //   "fill-antialias": true,
              //   "fill-color": "#666666",
              //   "fill-outline-color": "red",
              //   "fill-opacity": 0.4
              // }
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#00FF00",
                "line-width": 4
              }
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
      vm.map.on("moveend", () => {
        //获取地图视图移动之后的层级
        console.log(vm.map.getZoom());
        //获取map的sources
        console.log(vm.map.getSource("bianjie"));
        console.log(vm.map.getSource("test"));
      });
      vm.map.on("load", () => {
        console.log(vm.map.getZoom());
        //区划查询区划面信息
        let queryType = false;
        cubeService
          .getAreaInfoByAreaCode(mapConfig.areacode, queryType)
          .then(res => {
            console.log(res);
            let FeatureCollection = vm.convertFeatureCollection(
              queryType ? res.data.data.chirdAreaInfo : res.data.data.list,
              queryType
            );
            vm.map.getSource("bianjie").setData(FeatureCollection);
          });
      });
      var hoveredStateId = null;
      //   vm.map.on("mousemove", "bianjie_layer", function(e) {
      //     console.log(e);
      //   });
      vm.map.on("mouseleave", "bianjie_layer", function() {});
    },
    /**
     * @description: 多面构建FeatureCollection对象
     * @param {type}
     * @return:
     */
    convertFeatureCollection(list, type = true) {
      let geometry;
      let FeatureCollection = {
        type: "FeatureCollection",
        features: []
      };
      for (let i in list) {
        FeatureCollection.features.push({
          type: "Feature",
          properties: {},
          geometry: type ? list[i]._source.areainfo : list[i].areainfo
        });
      }
      return FeatureCollection;
    }
  }
};
</script>


<style lang="less" scoped>
.mapcontainer {
  width: 100vw;
  height: 80vh;
}
</style>
