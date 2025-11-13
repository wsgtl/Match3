import { delay } from "../../Match_common/utils/TimeUtil";
import { httpClient } from "../../Match_common/web/HttpClient";
import { ConfigConst } from "./ConfigConstManager";
import { ViewManager } from "./ViewManger";

export namespace WebManger {
    /**正式域名 */
    const BaseUrl = "https://qosh.xzsmxzckjyxgsgwsx.com";
    /**接口url */
    const Url = "/ebo/myvvi/blq/v1/ezddpb/abpjfk";

    export function init() {
        httpClient.setBaseURL(BaseUrl);
    }
    export async function getData() {
        ConfigConst.init();
        const res = await httpClient.get(Url);
        if(res.code==200){
            ConfigConst.calRes(res.data);
            console.log("获取配置成功");
            ViewManager.showTips("获取配置成功")
        }else{
            ViewManager.showTips("获取配置失败"+res.code)
            console.log("获取配置失败"+res.code);
        }
        
    }
  
}