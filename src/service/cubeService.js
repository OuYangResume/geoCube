import cubeAxios from "../utils/axios/cubeAxios";
class cubeService {
    /**
     * 构造函数
     * @param {*} options 
     */
    constructor(options) {
    }

    /**
   * @description: 根据区划code查询当前区划面信息
   * @param {areacode} areacode为区划code
   * @param {queryType} default为true父查子
   * @author oouyang
   * @return: data
   */
    static getAreaInfoByAreaCode(areacode, queryType = true) {
        let vm = this;
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
}

export default cubeService