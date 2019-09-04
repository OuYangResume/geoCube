/*
 * @Description: In User Settings Edit
 * @Author: oouyang
 * @Date: 2019-08-20 17:30:49
 * @LastEditTime: 2019-08-27 10:25:08
 * @LastEditors: Please set LastEditors
 */
import axios from "axios";
let md5 = require('md5');

/**
 * @description: 获取块数据请求之前的token
 * @param {type}
 * @return:
 */
function getCubeToken() {
    debugger
    let timestamp = new Date().getTime();
    sessionStorage.setItem('time', timestamp);
    let user = {
        userName: "zzpt",
        passWord: "geostar999"
    };
    let params = {
        time: timestamp,
        user: user.userName,
        secret: md5(timestamp + user.passWord)
    };
    return axios({
        method: "get",
        url: "http://geo-sz.fiebug.com:9000/ksj_api/getToken",
        params: params
    })
        .then(res => {
            console.log(res)
            if (res.data.success) {
                return res;
            } else {
                console.log("获取token失败")
            }
        })
        .catch(error => {
            reject(error);
        });
}


export function http() {
   return getCubeToken();
}
