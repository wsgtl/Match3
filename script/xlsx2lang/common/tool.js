
module.exports = {
    // 获取json内容
    getKey(obj, key) {
        let paths = obj;
        const str = key.split('.');
        try {
            str.forEach(item => {
                paths = paths[item];
            });

            if (paths) {
                return paths;
            }
            return '';

        } catch (error) {
            return '';
        }
    },
    keys(obj, str, value) {
        if(!obj)
            console.log(obj, str, value)
        const arr = str.split('.');
        let paths = obj;
        for (let i = 0, l = arr.length - 1; i <= l; i++) {
            if (i === l) {
                paths[arr[i]] = value;
            } else if (paths[arr[i]]) {
                paths = paths[arr[i]];
            } else {
                paths[arr[i]] = {};
                paths = paths[arr[i]];
            }
        }
    },

};