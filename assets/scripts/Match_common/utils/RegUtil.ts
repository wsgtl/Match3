export namespace RegUtil {
    const reg_phone = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
    const reg_email = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
    const reg_birthday = /^[0-9]{1,2}\/(0?[1-9]|1[12])\/(19|20)[0-9]{2}$/;
    /**验证手机号 */
    export function isPhone(str: string) {
        return reg_phone.test(str);
    }

    /**验证邮箱 */
    export function isEmail(str: string) {
        return reg_email.test(str);
    }
    /**验证生日是否正确 dd/mm/yyyy格式*/
    export function isBirthday(str: string) {
        const reg_birthday = /^[0-9]{1,2}\/(0?[1-9]|1[12])\/(19|20)[0-9]{2}$/;
        if (!reg_birthday.test(str)) return false;//先简单匹配格式是否正确
        let a = str.split("/");
        let _d = parseInt(a[0]);
        let _m = parseInt(a[1]);
        let _y = parseInt(a[2]);
        let date = new Date();
        let cur_d = date.getDate();
        let cur_m = date.getMonth() + 1;
        let cur_y = date.getFullYear();
        if (_y > cur_y) return false;//计算是否是未来的时间
        if (_y == cur_y && _m > cur_m) return false;
        if (_y == cur_y && _m == cur_m && _d > cur_d) return false;
        //计算每月最大天数
        let maxDay = 31;
        if ([4, 6, 9, 11].indexOf(_m) > -1) {
            maxDay = 30;
        } else if (_m == 2) {//计算闰月
            if ( _y %100==0) {
                maxDay = _y%400==0  ? 29 : 28;
            } else {
                maxDay = _y%4==0  ? 29 : 28;
            }
        }
        
        if (_d > maxDay || _d <= 0) return false;
        return true;
    }

   
}