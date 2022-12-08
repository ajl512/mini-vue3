import { extend } from "../shared";

let activeEffect;
let shouldTrack = true;
export class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  // effect执行时，初次调用一次，触发函数里的读取reactive数据，触发get操作，track进了依赖中；
  // 后续触发set时，trigger遍历执行依赖体时，再次被调用
  // 如果被stop后，即active变成false，那么此时
  run() {
    // activeEffect附值必须在调用之前； 否则在触发依赖收集时，拿到的当前执行体为undefined
    if (!this.active) {
      return this._fn();
    }

    // 首次active一定为true; 这时就该进行依赖收集，执行_fn()时会讲里面所有涉及get操作的key都进行了依赖收集；
    // 那么后续就没必要再进行重复收集了，一次shouldTrack就及时关闭了
    shouldTrack = true;
    activeEffect = this
    const res = this._fn()
    shouldTrack = false;
    return res
  }
  stop () {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
      if (this.onStop) {
        this.onStop()
      }
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetsMap = new Map();
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}
// target -> key -> dep依赖收集的容器用来存放传入的fn
// 因为fn不能重复，所以dep应该是set结构
// map结构的[['target1', ['key', set(fn1,fn2)]], ['target2', ['key', set(fn1,fn2)]]]
// 依赖收集
export function track(target, key) {
  if (!isTracking()) return
  // target -> key -> deps
  let depsMap = targetsMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetsMap.set(target, depsMap)
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep)
  }

  // 将依赖执行体收集起来
  trackEffects(dep)
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetsMap.get(target)
  const dep = depsMap.get(key)
  triggerEffets(dep)
}

export function triggerEffets(dep) {
  // 遍历set结构
  // 1. for/of; // 2. forEach; // 3. deps.values
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  // 进来就要先执行一次
  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
