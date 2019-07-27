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
            "line-color": "#00FF00",
            "line-width": 4
          }
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
      var nav = new mapboxgl.NavigationControl();
      vm.map.addControl(nav, "bottom-right");
      vm.map.on("load", () => {
        //在地图加载完之后加载所要添加的图层和数据源
        vm.addMapSourcesAndLayers();
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
      vm.map.on("moveend", () => {
        //获取地图视图移动之后的层级
        let zoom = vm.map.getZoom();
        //当地图层级大于16级才去请求可视范围内的楼栋数据
        if (zoom > 16) {
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
        className: 'my-class'
      });
      vm.map.on("mousemove", "loudon_layer", function(e) {
          console.log(e)
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
      for (let i in list) {
        FeatureCollection.features.push({
          type: "Feature",
          properties: {
            areaname: list[i].areaname != " " ? list[i].areaname : "暂无数据",
            type: i,
            height: Math.round(Math.random() * 100 + 10),
            min_height: 0
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
.mapcontainer {
  width: 100vw;
  height: 80vh;
}
.my-class{
    background-color: aqua;
    width: 100px;
}
</style>
