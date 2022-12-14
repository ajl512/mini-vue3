import { mutableHandles, readonlyHandles, shallowReadonlyHandles } from './basiHandle';
import { isRef, ref, unRef } from './ref';

// 取名另类 内置属性
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

function createActiveObject(raw, basicHandles) {
  return new Proxy(raw, basicHandles)
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandles)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandles)
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandles)
}

export function isReactive(obj) {
  // 如果proxy代理的对象，那么get时一定会先触发get方法，从里面拿返回值，这时不是被readonly的，就是reactive
  // 如果不是proxy代理的对象，那么这个对象上定然没有`__v_isReactive`该属性，那么返回的就是undefined; 但是期待是false,用!!
  return !!obj[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(val) {
  return !!val[ReactiveFlags.IS_READONLY]
}

// 判断对象是否是isProxy,就是判断是否是isReactive和isReadonly，首先如果不是proxy不能触发get,那就肯定不属于了； 其次再在get中判断属于哪一种proxy
export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw)
}

export function proxyRefs(objectWidthRefs) {
return new Proxy(objectWidthRefs, {
  get(target, key) {
    return unRef(Reflect.get(target, key))
  },
  set(target, key, value) {
    if (isRef(target[key]) && !isRef(value)) {
      return target[key].value = value
    } else {
      return target[key] = value
    }
  }
})
}
