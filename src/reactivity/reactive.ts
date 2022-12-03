import { mutableHandles, readonlyHandles } from './basiHandle';
import { track, trigger } from './effect';



export function reactive(raw) {
  return createActiveObject(raw, mutableHandles)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandles)
}

function createActiveObject(raw, basicHandles) {
  return new Proxy(raw, basicHandles)
}
