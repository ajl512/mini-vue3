import { track, trigger } from "./effect"
import { ReactiveFlags } from './reactive'

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly: boolean = false) {
  return function get(target,key) {
    const res = Reflect.get(target, key)
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
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
