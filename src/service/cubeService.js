import cubeAxios from "../utils/axios/cubeAxios";

class cubeService {
    /**
     * 构造函数
     * @param {*} options 
     */
    constructor(options) {
    }
    /**
     * @description: 根据可视范围查询空间信息
     * @param {paramType} 不传默认查楼栋，1区2街道3社区4网格
     * @param {coordinates} 可视范围(对角线左上角坐标和右下角坐标)几何信息;
     * @return: 
     */
    static getAreaInfoByCoordinates(coordinates, paramType) {
        let params = {
            request_type: "post",
            paramCodeList: "KJ5003",
            paramType: paramType,
            coordinates: coordinates
        };
        //如果查楼栋，则需要删除paramType属性
        if (paramType == undefined) {
            delete params.paramType;
        }
        let url1 = "http://192.168.1.192:9000/ksj_api/common_api/getAreaBase";
        return new Promise((resolve, reject) => {
            cubeAxios
                .Ajax(url1, params)
                .then(res => {
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    /**
   * @description: 根据区划code查询当前区划面信息
   * @param {areacode} areacode为区划code
   * @param {queryType} default为true父查子
   * @author oouyang
   * @return: data
   */
    static getAreaInfoByAreaCode(areacode, queryType = true) {
        //请求类型；KJ5001为父区划查询子区划面信息,KJ5002根据当前区划查询当前区划面信息
        const paramCodeList = ["KJ5001", "KJ5002"];
        let params = {
            request_type: "post",
            paramCodeList: queryType ? paramCodeList[0] : paramCodeList[1],
            areacode: areacode
        };
        let url1 = "http://192.168.1.192:9000/ksj_api/common_api/getAreaBase";
        return new Promise((resolve, reject) => {
            cubeAxios
                .Ajax(url1, params)
                .then(res => {
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    /**
    * @description: 多条件地址列表分页排序查询检索适用范围。
    * @param {type}
    * @return:
    */
    static getLoadInfoByAreaCode(areacode) {
        let params = {
            request_type: "post",
            paramCodeList: "OT6033", //维度参数固定
            areacode: areacode,
            dzlx: "4", //1房间，2小区，3楼栋，4道路
            cxtj: "", //过滤条件，支持地址名和地址编码；可以不传
            page: "1",
            pageSize: "100",
            sort: "", //支持地址名称排序(name)，地址编码排序(code) 如果不传默认不排序
            sortType: "" //降序(desc)，升序(asc),如果不传默认降序
        };
        let url1 = "http://192.168.1.192:9000/ksj_api/common_api/getKsjInfo";
        return new Promise((resolve, reject) => {
            cubeAxios
                .Ajax(url1, params)
                .then(res => {
                    resolve(res);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

export default cubeService