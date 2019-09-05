<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-22 13:53:15
 * @LastEditTime: 2019-09-05 14:25:02
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div id="container">
    <div :id="mapId" class="mapcontainer"></div>
    <canvas id="deck-canvas"></canvas>
  </div>
  <!-- <div :id="mapId" class="mapcontainer"></div> -->
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
const AIR_PORTS =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson";
import { Deck } from "@deck.gl/core";
import { PhongMaterial } from "@luma.gl/core";
import { GeoJsonLayer, ArcLayer, PolygonLayer } from "@deck.gl/layers";
import cubeService from "../../service/cubeService";
import cubeAxios from "../../utils/axios/cubeAxios";
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
            },
            //道路
            load: {
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
            },
            //道路图层
            {
              id: "load_layer",
              type: "line",
              source: "load",
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "red",
                "line-width": 4
              }
            }
          ]
        }, //mapConfig.style,
        interactive: false, //
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
      vm.initDeck();
      vm.map.on("moveend", () => {
        //获取地图视图移动之后的层级
        console.log(vm.map.getZoom());
        //获取map的sources
        console.log(vm.map.getSource("bianjie"));
        console.log(vm.map.getSource("test"));
      });
      vm.map.on("load", () => {
        console.log(vm.map.getZoom());
        //获取道路信息数据
        cubeService.getLoadInfoByAreaCode(mapConfig.areacode).then(res => {
          console.log(res);
          let list = res.data.data.list;
          let FeatureCollection = {
            type: "FeatureCollection",
            features: []
          };
          for (let i in list) {
            FeatureCollection.features.push({
              type: "Feature",
              properties: {},
              geometry: list[i]._source.areainfo
            });
          }
          vm.map.getSource("load").setData(FeatureCollection);
        });
        //区划查询区划面信息
        let queryType = true;
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
    async initDeck() {
      let vm = this;
      let DeckPointData = await vm.createDeckPointData();
      let DeckPolygonData = await vm.createDeckPolygonData();
      console.log(DeckPolygonData);
      const material = new PhongMaterial({
        ambient: 0.1,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [60, 64, 70]
      });
      const deck = new Deck({
        canvas: "deck-canvas",
        width: "100%",
        height: "100%",
        initialViewState: {
          latitude: 22.546,
          longitude: 113.923,
          zoom: 11,
          bearing: 0,
          pitch: 0
        },
        controller: true,
        onViewStateChange: ({ viewState }) => {
          vm.map.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch
          });
        },
        layers: [
          //   new PolygonLayer({
          //     id: "buildings",
          //     data: DeckPolygonData.features,
          //     extruded: true,
          //     wireframe: false,
          //     opacity: 0.4,
          //     getPolygon: f => f.geometry.coordinates,
          //     getElevation: f => f.properties.scalerank,
          //     getFillColor: f => [Math.round(Math.random() * 100 + 10), 10, Math.round(Math.random() * 100 + 100)],
          //     material
          //   }),

          new GeoJsonLayer({
            id: "airports",
            data: DeckPointData,
            // Styles
            filled: true,
            pointRadiusMinPixels: 2,
            opacity: 1,
            pointRadiusScale: 50,
            getRadius: f => 11 - f.properties.scalerank,
            getFillColor: [200, 0, 80, 180],
            // Interactive props
            pickable: true,
            autoHighlight: true,
            onClick: info =>
              // eslint-disable-next-line
              info.object && alert(`${info.object.properties.name}`)
          }),

          new ArcLayer({
            id: "arcs",
            data: DeckPointData.features,
            pickable: false,
            // Styles
            getSourcePosition: f => [113.91159785, 22.54725131], // London
            getTargetPosition: f => f.geometry.coordinates,
            getSourceColor: [0, 128, 200],
            getTargetColor: [200, 0, 80],
            getWidth: 10,
            onHover: ({ object, x, y }) => {
              console.log(object);
              const tooltip = `${object.properties.name} to ${object.properties.name}`;
              /* Update tooltip
             http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
          */
            }
          })
        ]
      });
    },
    /**
     * @description: 创建Deck_PolygonLayer所需数据
     * @param {type}
     * @return:
     */
    async createDeckPolygonData() {
      let vm = this;
      let queryType = true;
      let FeatureCollection = {
        type: "FeatureCollection",
        features: []
      };
      await cubeService
        .getAreaInfoByAreaCode(mapConfig.areacode, queryType)
        .then(res => {
          console.log(res);
          let list = res.data.data.chirdAreaInfo;
          for (let i in list) {
            FeatureCollection.features.push({
              type: "Feature",
              properties: {
                scalerank: i * 1000,
                name: list[i]._source.areaname
              },
              geometry: list[i]._source.areainfo
            });
          }
        });
      return FeatureCollection;
    },
    /**
     * @description: 构建Deck_GeoJsonLayer所需数据
     * @param {type}
     * @return:
     */
    async createDeckPointData() {
      let vm = this;
      let queryType = true;
      let FeatureCollection = {
        type: "FeatureCollection",
        features: []
      };
      await cubeService
        .getAreaInfoByAreaCode(mapConfig.areacode, queryType)
        .then(res => {
          console.log(res);
          let list = res.data.data.chirdAreaInfo;
          for (let i in list) {
            FeatureCollection.features.push({
              type: "Feature",
              properties: {
                scalerank: i,
                name: list[i]._source.areaname
              },
              geometry: list[i]._source.location
            });
          }
        });
      return FeatureCollection;
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
#container {
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
}
#container > * {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
