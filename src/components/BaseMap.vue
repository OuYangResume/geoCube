<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-22 11:44:31
 * @LastEditTime: 2019-09-05 14:02:22
 * @LastEditors: Please set LastEditors
 -->
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
      "http://192.168.1.252:6080/arcgis/rest/services/SZKSJ/DTVEC_ZQ_SS_SZ/MapServer/tile/{z}/{y}/{x}"
    ],
    zoomOffset: 10, // wmts Capabilities信息中TileMatrix第一个对应的实际多少级
    tileSize: 256
  },
  units: "degrees",
  ldHeight: 3
};
import cubeService from "../service/cubeService";
import * as THREE from "three";
import mapboxgl from "mapbox-gl";
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
      
     // let customLayer = vm.CustomLayer();
      vm.map.on("load", () => {
        //在地图加载完之后加载所要添加的图层和数据源
        vm.addMapSourcesAndLayers();

       // vm.map.addLayer(customLayer, "waterway-label");
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
     * @description: 自定义图层
     * @param {type}
     * @return:
     */
    CustomLayer() {
      // parameters to ensure the model is georeferenced correctly on the map
      var modelOrigin = [113.923, 22.546];
      var modelAltitude = 0;
      var modelRotate = [Math.PI / 2, 0, 0];

      var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      );

      // transformation parameters to position, rotate and scale the 3D model onto the map
      var modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since our 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
      };

      // var THREE = window.THREE;

      // configuration of the custom layer for a 3D model per the CustomLayerInterface
      var customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: function(map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // create two three.js lights to illuminate the model
          var directionalLight = new THREE.DirectionalLight(0xffffff);
          directionalLight.position.set(0, -70, 100).normalize();
          this.scene.add(directionalLight);

          var directionalLight2 = new THREE.DirectionalLight(0xffffff);
          directionalLight2.position.set(0, 70, 100).normalize();
          this.scene.add(directionalLight2);

          // use the three.js GLTF loader to add the 3D model to the three.js scene
          var loader = new THREE.GLTFLoader();
          loader.load(
            "https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf",
            function(gltf) {
              this.scene.add(gltf.scene);
            }.bind(this)
          );
          this.map = map;

          // use the Mapbox GL JS map canvas for three.js
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });

          this.renderer.autoClear = false;
        },
        render: function(gl, matrix) {
          var rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX
          );
          var rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY
          );
          var rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ
          );

          var m = new THREE.Matrix4().fromArray(matrix);
          var l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix.elements = matrix;
          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.state.reset();
          this.renderer.render(this.scene, this.camera);
          this.map.triggerRepaint();
        }
      };

     // return customLayer;

      /////////////////
      var highlightLayer = {
        id: "highlight",
        type: "custom",

        onAdd: function(map, gl) {
          var vertexSource =
            "" +
            "uniform mat4 u_matrix;" +
            "attribute vec2 a_pos;" +
            "void main() {" +
            "    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);" +
            "}";

          var fragmentSource =
            "" +
            "void main() {" +
            "    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);" +
            "}";

          var vertexShader = gl.createShader(gl.VERTEX_SHADER);
          gl.shaderSource(vertexShader, vertexSource);
          gl.compileShader(vertexShader);
          var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
          gl.shaderSource(fragmentShader, fragmentSource);
          gl.compileShader(fragmentShader);

          this.program = gl.createProgram();
          gl.attachShader(this.program, vertexShader);
          gl.attachShader(this.program, fragmentShader);
          gl.linkProgram(this.program);

          this.aPos = gl.getAttribLocation(this.program, "a_pos");

          var helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 113.923,
            lat: 23.546
          });
          var berlin = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 113.923,
            lat: 22.546
          });
          var kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 113.823,
            lat: 22.646
          });

          this.buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
              helsinki.x,
              helsinki.y,
              berlin.x,
              berlin.y,
              kyiv.x,
              kyiv.y
            ]),
            gl.STATIC_DRAW
          );
        },

        render: function(gl, matrix) {
          gl.useProgram(this.program);
          gl.uniformMatrix4fv(
            gl.getUniformLocation(this.program, "u_matrix"),
            false,
            matrix
          );
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
          gl.enableVertexAttribArray(this.aPos);
          gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
        }
      };

      return highlightLayer;
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
.my-class {
  background-color: aqua;
  width: 100px;
}
</style>
