let activeEffect;
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // activeEffect附值必须在调用之前； 否则在触发依赖收集时，拿到的当前执行体为undefined
    activeEffect = this
    this._fn()
  }
}

const targetsMap = new Map();

// target -> key -> dep依赖收集的容器用来存放传入的fn
// 因为fn不能重复，所以dep应该是set结构
// map结构的[['target1', ['key', set(fn1,fn2)]], ['target2', ['key', set(fn1,fn2)]]]
// 依赖收集
export function track(target, key) {
  let depsMap = targetsMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetsMap.set(target, depsMap)
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps)
  }

  // 将依赖执行体收集起来
  deps.add(activeEffect)
}

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
export function effect(fn) {
  // 进来就要先执行一次
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
