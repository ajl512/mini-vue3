# 实现effect

1. 新建`effect.spec.ts`文件，写effct核心的测试；
  * 首先有个`reactive`函数，声明一个`target`;
  * 接着有个`effect`函数，它接收一个执行体`fn`,并且会首先执行一次；因为里面会读取target所以会触发get方法，进行依赖收集；
  * 然后我们尝试修改`target`, effect要能够重新执行`fn`，使新数据更新；

```js
import { reactive } from '../reactive';
import { effect } from '../effect';
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++;
    expect(nextAge).toBe(12)
  })
})

```
2. 实现`reactive`
它就是一个proxy

```js
// src/reactivity/reactive.ts
import { track, trigger } from './effect';
export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      // 收集依赖
      track(target, key)
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      // 触发依赖
      trigger(target, key)
      return res;
    }
  })
}
```

* Proxy和Reflect都是es6语法，ts不支持； 因此要修改`tsconfig.json`配置；`"libs":["DOM","es6"]`

3. 实现`effect`; effect接收一个`fn`; 我们将其用对象存起来

```js
// src/reactivity/effect.ts
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    this._fn()
  }
}

export function effect(fn) {
  // 进来就要先执行一次
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
```
此时通过断言，已经能通过`expect(nextAge).toBe(11)`;
但是，不能实现`update`; 也就是
```js
    user.age++;
    expect(nextAge).toBe(12)
```
`user.age++`会触发`reactive`的`set`函数，这时应该`触发依赖`，让`() => {nextAge = user.ag+ 1}`再执行一遍;

所以进入`收集依赖`和`触发依赖`流程；

4. `收集依赖`
在`reactive`的get函数中`track(target, key)`;因为具体的依赖函数体在`effect`处，因此在`// src/reactivity/effect.ts`中进行编写`track`

因为会有很多个`reactive(target)`； 所以应该有个target存储器；便于存取；用map结构
```js
const targetsMap = new Map();
```
`target`中每一个`key`有可能被多处使用，做多种处理`fn`； 因此我们最终的存储器结构应该是
map结构的[键`target`, "值 嵌套的map结构的[键`key` . 值`set结构的fn存储器`]"]
所以
```js
const targetsMap = new Map()
export function track(target, key) {
  let depsMap = targetsMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetsMap.set(target, depsMap)
  }

  let depsSet = depsMap.get(key);
  if (!depsSet) {
    depsSet = new Set();
    depsMap.set(key, depsSet)
  }
  // ??? activeEffect
  depsSet.add(activeEffect)
}
```

4.1 `activeEffect`是指当前执行或者说激活的`effect`的参数`fn`;所以可以声明一个全局的变量

```js
let activeEffect;
// fn被调用时收集
// src/reactivity/effect.ts
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this
    this._fn()
  }
}
```

5. `触发依赖`这个就比较简单了； 将`targetsMap`中改变的`key`中所有的`fn`遍历执行一遍即可

```js
// 触发依赖
export function trigger(target, key) {
  const depsMap = targetsMap.get(target)
  const deps = depsMap.get(key)
  // 遍历set结构
  // 1. for/of; // 2. forEach; // 3. deps.values
  for (const effect of deps) {
    effect.run()
  }
}
```
