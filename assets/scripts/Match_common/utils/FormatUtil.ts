export namespace FormatUtil {
    /**秒数转化为00:11这样的格式
     * @param colon 使用图集时，冒号:不能直接给图片取名，这里可以替换成其他字符
     */
    export function mColonS(time: number, colon: string = ":") {
        const minute = Math.floor(time / 60).toString().padStart(2, "0");
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return minute + colon + seconds;
    }

    /**秒数转化为20.113"这样的格式*/
    export function formatMs(time: number) {
        const seconds = Math.floor(time);
        const ms = Math.floor((time - seconds) * 1000).toString().padStart(3, "0");
        return seconds + "." + ms + "”";
    }
    /**将数字改为70.00这种格式 */
    export function toXX_XX(num: number) {
        const formattedNum = num.toFixed(2);
        // 将小数点的"."替换为"_"
        return formattedNum.replace('.', '_');
    }
    // /**将数字改为1,000.00这种格式 */
    // export function toXXDXX(num: number, xsd: number = 4, useGrouping: boolean = true): string {
    //     if (isNaN(num)) return 'NaN';

    //     const isInteger = Number.isInteger(num);
    //     let fixedNum = num;

    //     // 非整数时，截断到 xsd 位小数
    //     if (!isInteger) {
    //         const factor = Math.pow(10, xsd);
    //         fixedNum = Math.floor(num * factor) / factor;
    //     }

    //     // 分离整数和小数部分
    //     let [integerPart, decimalPart = ''] = fixedNum.toString().split('.');

    //     // 处理千分位逗号
    //     if (useGrouping) {
    //         integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    //     }

    //     // 处理小数部分（去掉末尾的 0）
    //     if (decimalPart) {
    //         decimalPart = decimalPart.replace(/0+$/, ''); // 去掉末尾多余的 0
    //         if (decimalPart.length > 0) {
    //             return `${integerPart}_${decimalPart}`;
    //         }
    //     }

    //     return integerPart;
    // }
    /** 将数字转换为指定格式的字符串，如 1000.302 变成 "1,000_302" */
export function toXXDXX(
    num: number, 
    xsd: number = 4, 
    useGrouping: boolean = true,
    minDecimalDigits: number = 0 // 新增参数：小数部分最小位数
): string {
    if (isNaN(num)) return 'NaN';

    const isInteger = Number.isInteger(num);
    let fixedNum = num;
    
    // 非整数时，截断到 xsd 位小数
    if (!isInteger) {
        const factor = Math.pow(10, xsd);
        fixedNum = Math.floor(num * factor) / factor;
    }
    
    // 分离整数和小数部分
    let [integerPart, decimalPart = ''] = fixedNum.toString().split('.');
    
    // 处理千分位逗号
    if (useGrouping) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // 处理小数部分
    if (decimalPart) {
        // 去掉末尾多余的 0
        decimalPart = decimalPart.replace(/0+$/, '');
        
        // 如果小数位数不足最小位数，则补零
        if (decimalPart.length < minDecimalDigits) {
            decimalPart = decimalPart.padEnd(minDecimalDigits, '0');
        }
        
        if (decimalPart.length > 0) {
            return `${integerPart}_${decimalPart}`;
        }
    } else if (minDecimalDigits > 0) {
        // 如果没有小数部分但要求最小位数，则添加指定数量的小数零
        const zeros = '0'.repeat(minDecimalDigits);
        return `${integerPart}_${zeros}`;
    }
    
    return integerPart;
}

    /**将数字改为1,000.00这种格式,并控制小数点数量 */
    export function toXXDXXxsd(num: number, useGrouping: boolean = true,minDecimalDigits: number = 0) {
        const xsd = num > 1 ? 2 : (num > 0.01 ? 4 : 6);
        return FormatUtil.toXXDXX(num, xsd, useGrouping, minDecimalDigits);
    }
}