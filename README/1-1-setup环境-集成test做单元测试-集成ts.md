# 1-1-setup环境-集成test做单元测试-集成ts.md

1. 新建文件夹`yarn init -y`
2. 新建src文件夹； 新建reactivity文件夹
3. 新建`reactivity/index.ts` 出口文件；
4. 新建`reactivity/tests` 测试文件夹；新建`reactivity/tests/index.spec.ts`临时测试
5. 在`testsindex.spec.ts`中写入`it('init', () => { expect(add(1,3)).toBe(4);})`
6. 文件要先支持ts; `yarn add typescript --dev`; 然后执行`npx tsc --init`初始化`tsconfig.json`文件
7. 引入jest文件以及支持typescript的文件 `yarn add --dev jest`; `yarn add --dev @types/jest`[这个对全jest不需要单独引入类型] 合并成一个命令就是`yarn add jest @types/jest --dev`;
8. 然后在`tsconfig.json`中找到`"types"`写入`"types": ["jest"]`;
9. 然后在`package.json`中新建脚本命令`"script": {"test": "jest"}`
10. 这时在终端执行`yarn test`; 可以看到执行通过；

11. 然后配置要支持`ES Module`语法; 测试在index.js中`export`一个add方法，再在test文件中`import` 提示`SyntaxError: Cannot use import statement outside a module`;

12. 这时要支持bable， 参考jest官方说明 `yarn add --dev babel-jest @babel/core @babel/preset-env`;
13. 然后新增`babel.config.js`;

```js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};
```

14. babel要支持ts，所以`yarn add --dev @babel/preset-typescript`然后

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
```

最后再运行`yarn test`; 执行成功； 这时表示环境已经配置好了
