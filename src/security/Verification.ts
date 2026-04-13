import { StatusCode } from "@/enum/StatusCode";
import { ElMessage } from "element-plus";

export function verification(statusCode:string): boolean {
    switch (statusCode){
        case StatusCode.OP_FAILED:{
            ElMessage.error("操作失败");
            return false;
        }
        case StatusCode.EMPTY_USER:{
            ElMessage.error("用户名不存在或密码不正确！");
            return false;
        }
        case StatusCode.INVALID_USER:{
            ElMessage.error("无效的用户！");
            return false;
        }
        case StatusCode.SUCCESS:{
            return true;
        }
        default:{
            ElMessage.warning("未知statusCode参数。");
            return false;
        }
    }
}