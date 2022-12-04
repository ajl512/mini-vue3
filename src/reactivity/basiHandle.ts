import { isObject } from "../shared";
import { track, trigger } from "./effect"
import { isReadonly, reactive, ReactiveFlags } from './reactive'

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly: boolean = false) {
  return function get(target,key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    }

    const res = Reflect.get(target, key)
    if (isObject(res)) {
      return isReadOnly ? isReadonly(res) : reactive(res)
    }
    if (!isReadOnly) {
      track(target, key)
    }
    return res
  }
}


function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res;
  }
}

export const mutableHandles =  {
  get,
  set,
}

export const readonlyHandles = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key} can not set ${value}, because target is readonly`, target);
    return true;
  }
}
