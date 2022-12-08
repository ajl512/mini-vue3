import { ReactiveEffect } from "./effect";

class ComputedImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: any;
  constructor(getter) {
    this._getter = getter
    // 收集依赖
    // getter
    this._effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
    })
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run()
    }

    return this._value
  }

}
export function computed(getter) {
  // 通过.value方式 读取值；用class类方式
  // 再次读取时 应该有缓存 加把锁即可
  // getter中的依赖项发生改变时，getter需要重新执行； 这就需要把getter当依赖项收集起来，set时就要触发trigger执行依赖；
  // 再次读取时，拿到的就是改变后的最新值
  return new ComputedImpl(getter)
}
