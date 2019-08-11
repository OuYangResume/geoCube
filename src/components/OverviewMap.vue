<template>
  <div :id="mapId"></div>
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
import * as turf from "@turf/turf";
export default {
  data() {
    return {
      map: null
    };
  },
  props: {
    mapId: {
      type: String,
      default: "miniMap"
    },
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
      this.highLightBianjie(val);
    },
    FeatureCollection: function(val) {
      //边界自适应,指定地理范围内的可见区域.
      var bbox = turf.bbox(val);
      this.map.fitBounds(bbox, {
        padding: { top: 5, bottom: 0, left: 0, right: 10 }
      });
      this.map.getSource("bianjie").setData(val);
    }
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      let vm = this;
      vm.map = new GeoGlobe.Map({
        mapCRS: mapConfig.mapCRS,
        style: {
          version: 8,
          sources: {},
          layers: []
        }, //mapConfig.style,
        container: vm.mapId,
        units: mapConfig.units, //可以不需要设置
        minZoom: 10,
        maxZoom: 24,
        center: [113.923, 22.546],
        zoom: 9,
        epsg: "EPSG:4490",
        doubleClickZoom: false,
        isIntScrollZoom: false, //缩放级别是否为整数处理模式
        renderWorldCopies: false,
        isAttributionControl: false
      });
      vm.addMapEventListene();
    },
    /**
     * @description: 给Map添加一些监听事件
     * @param {type}
     * @return:
     */
    addMapEventListene() {
      let vm = this;
      vm.map.on("load", () => {
        //在地图加载完之后加载所要添加的图层和数据源
        vm.addMapSourcesAndLayers();
      });
      //定义楼栋图层的popup
      let louDonPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "my-class"
      });
      vm.map.on("mousemove", "bianjie_layer", function(e) {
        //设置鼠标样式
        vm.map.getCanvas().style.cursor = "pointer";
        let coordinates = e.lngLat;
        let description = e.features[0].properties.areaname;
        louDonPopup
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(vm.map);
      });
      vm.map.on("mouseleave", "bianjie_layer", function() {
        //还原鼠标样式
        vm.map.getCanvas().style.cursor = "grab";
        louDonPopup.remove();
      });
      //鹰眼图的单击事件，并触发父组件的视图改变事件
      vm.map.on("click", "bianjie_layer", function(e) {
        let zoom;
        vm.$emit('flyto',JSON.parse(e.features[0].properties.location),zoom);
        // vm.$parent.map.flyTo({
        //   center: JSON.parse(e.features[0].properties.location)
        // });
      });
      //鹰眼图的双击事件，并触发父组件的视图改变事件
      vm.map.on("dblclick", "bianjie_layer", function(e) {
        console.log(e);
        var zoom;
        switch (e.features[0].properties.areacode.length) {
          case 6:
            zoom = 14; //区级
            break;
          case 9:
            zoom = 16; //街道
            break;
          case 12:
            zoom = 18; //社区
            break;
        }
        if (zoom != undefined) {
          vm.$emit('flyto',JSON.parse(e.features[0].properties.location),zoom);
          // vm.$parent.map.flyTo({
          //   center: JSON.parse(e.features[0].properties.location),
          //   zoom: zoom
          // });
        }
      });
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
      //边界图层
      if (vm.map.getLayer("bianjie_layer") == undefined) {
        vm.map.addLayer({
          id: "bianjie_layer",
          type: "fill",
          source: "bianjie",
          layout: {
            visibility: "visible"
          },
          paint: {
            "fill-opacity": 0.8,
            "fill-color": "#00FF00",
            "fill-outline-color": "#FFFF00"
          }
        });
      }
    },
    /**
     * @description: 高亮当前区划
     * @param {type}
     * @return:
     */
    highLightBianjie(code) {
      this.map.setPaintProperty("bianjie_layer", "fill-color", [
        "match",
        ["get", "areacode"],
        code,
        "#FFFF00",
        "#00FF00"
      ]);
    }
  }
};
</script>

<style lang="less" scoped>
.mapcontainer {
  width: 100%;
  height: 100%;
}
</style>
