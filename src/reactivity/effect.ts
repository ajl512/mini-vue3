import { extend } from "../shared";

let activeEffect;
class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    // activeEffect附值必须在调用之前； 否则在触发依赖收集时，拿到的当前执行体为undefined
    activeEffect = this
    return this._fn()
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
}

const targetsMap = new Map();

// target -> key -> dep依赖收集的容器用来存放传入的fn
// 因为fn不能重复，所以dep应该是set结构
// map结构的[['target1', ['key', set(fn1,fn2)]], ['target2', ['key', set(fn1,fn2)]]]
// 依赖收集
export function track(target, key) {
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

  if (!activeEffect) return
  // 将依赖执行体收集起来
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetsMap.get(target)
  const deps = depsMap.get(key)
  // 遍历set结构
  // 1. for/of; // 2. forEach; // 3. deps.values
  for (const effect of deps) {
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
