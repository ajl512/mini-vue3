import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffets } from "./effect";
import { reactive } from "./reactive";

class RefTemf {
  private _value: any;
  public _dep: Set<unknown>;
  private _originRaw: any;
  constructor(value) {
    // 如果传过来的value是对象，那么就需要用reactive包裹
    this._originRaw = value
    this._value = convert(value);
    this._dep = new Set();
  }
  get value() {
    // 收集依赖
    // 注意依赖收集，一定是要有依赖的 也就是effect,如果读取时压根没有依赖就会报错；因此需要校验
    trackRefEffect(this)
    return this._value
  }
  set value(newVal) {
    // 如果传过来的value是一个object的话，上面就进行了reactive包裹成了proxy，此时对比是不对的；
    // 因此需要一个记录转变之前的值
    // if (!hasChanged(newVal, this._value)) return
    if (!hasChanged(newVal, this._originRaw)) return
    this._originRaw = newVal
    this._value = convert(newVal);
    triggerEffets(this._dep)
  }
}

function trackRefEffect(ref) {
  if (isTracking()) {
    trackEffects(ref._dep)
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(val) {
  return new RefTemf(val)
}
