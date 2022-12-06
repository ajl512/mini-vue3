import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, ref, unRef } from "../ref"

describe('ref', () => {
  it('return value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('set value trigger effect', () => {
    let dummy;
    let count = 0
    const age = ref(1)
    expect(age.value).toBe(1)
    effect(() => {
      count++
      dummy = age.value
    })
    expect(count).toBe(1)
    expect(dummy).toBe(1)
    // set 需要触发依赖
    age.value = 2
    expect(count).toBe(2)
    expect(dummy).toBe(2)
    // 更新相同时，不重复触发
    age.value = 2
    expect(count).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested properies reactive', () => {
    const a = ref({ age: 1 })
    expect(a.value.age).toBe(1)
    let dummy
    effect(() => {
      dummy = a.value.age
    })
    expect(dummy).toBe(1)
    a.value.age = 3
    expect(dummy).toBe(3)
  })

  it('isRef', () => {
    const a = ref(1)
    const b = reactive({
      c: 1
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(b)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
})
