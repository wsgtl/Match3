/* eslint-disable no-console */

import { sys } from "cc";

/**
 * 日志打印
 */

const isDebug = true; // 打印开关，可以根据环境变量去配置
interface LogLevel {
    log: string;
    info: string;
    warn: string;
    error: string;
}
const logLevel: Array<keyof LogLevel> = ["log", "info", "warn", "error"];
const printColorDict: LogLevel = {
    // 打印的颜色
    log: "#26a1f9",
    info: "#24ca39",
    warn: "#e4c52b",
    error: "#d21c1c",
};

interface IDebugger {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

export default function Debugger(sign: string): IDebugger {
    const debug: IDebugger = {
        log: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
    };
    if (!isDebug) return debug;

    if (!sys.isNative) {
        return prepareConsoleLogger(sign);
    }

    return prepareNativeLogger(sign);
}

function prepareConsoleLogger(sign: string) {
    const debug: Partial<IDebugger> = {};
    logLevel.forEach((level) => {
        debug[level] = (...args: any[]) => {
            console.log(
                `%c[${sign}]`,
                `color:${printColorDict[level]}`,
                ...args
            );
        };
    });
    return debug as IDebugger;
}

function prepareNativeLogger(sign: string) {
    const debug: Partial<IDebugger> = {};
    logLevel.forEach((level) => {
        debug[level] = (...args: any[]) => {
            try {
                const content = JSON.stringify(args);
                chunkString(content, 200).forEach((c) => {
                    console.log(`%c[${sign}]`, c);
                    if (enableWebsocket) {
                        getDefaultSocketLogger().log(sign, JSON.stringify(c));
                    }
                });
            } catch (error) {
                console.error(`%c[${sign}]`, "打印内容包含复杂对象");
            }
        };
    });
    return debug as IDebugger;
}

function chunkString(str: string, len: number) {
    const size = Math.ceil(str.length / len);
    const r: string[] = Array(size);
    let offset = 0;

    for (let i = 0; i < size; i++) {
        r[i] = str.substring(offset, offset + len);
        offset += len;
    }

    return r;
}

let wsReady: Promise<WebSocket> | null = null;
let enableWebsocket = false;
let _defaultSocketLogger: IDebugger | null = null;
function getDefaultSocketLogger() {
    if (!_defaultSocketLogger) {
        _defaultSocketLogger = SocketLogger();
    }
    return _defaultSocketLogger;
}

function SocketLogger() {
    const debug: Partial<IDebugger> = {};
    logLevel.forEach((level) => {
        debug[level] = async (sign: string, info: string) => {
            const ws: WebSocket | null = await wsReady;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(`[${sign}] ${level}: ${info}`);
            }
        };
    });
    return debug as IDebugger;
}
/**
 * 设置 WebSocket 地址并启用 SocketLogger `ws://ip:port`
 * 本地默认端口为 9596
 * @param uri
 */
// export async function setSocketLoggerURI(uri: string) {
//     if (!isProd()) {
//         enableWebsocket = true;
//         if (wsReady) {
//             const _ws = await wsReady;
//             if (_ws && _ws.readyState === WebSocket.OPEN) {
//                 _ws.close();
//             }
//         }
//         wsReady = new Promise((resolve) => {
//             const ws = new WebSocket(uri);
//             ws.onopen = (event) => {
//                 resolve(ws);
//             };
//             ws.onerror = () => {
//                 resolve(null);
//             };
//             ws.onclose = () => {};
//         });
//         await wsReady;
//     }
// }
