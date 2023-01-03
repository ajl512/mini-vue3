

// rollup用于库的打包 webpack用于应用的打包
// rollup 天然就支持esm
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
    input: "./src/index.ts", // 打包入口文件
    output: [
        // 库打包现在一般是两个，一个是cjs -> commonJs规范
        // 还有就是最新的 esm 是最新的标准化规范 也就是es6的module js
        {
            format: "cjs",
            file: pkg.main
        },
        {
            format: "es",
            file: pkg.module
        },
    ],
    // 因为我们的代码是用ts去写的，这就需要进行编译一下
    // packjson中 -c 就是指定读取的配置文件
    plugins: [
        typescript(),
    ]
}
