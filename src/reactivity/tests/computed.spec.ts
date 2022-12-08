import { computed } from "../computed"
import { ref } from "../ref"

describe('computed', () => {
  it('happy path', () => {
    const foo = ref(1)
    const jestFn = jest.fn(() => {
      return foo.value + 1
    })
    const computedValue = computed(jestFn)
    // 通过.value方式 读取值
    expect(computedValue.value).toBe(2)
    expect(jestFn).toBeCalledTimes(1);

    // 再次读取时 应该有缓存; jestFn不应该再被重新调用
    expect(computedValue.value).toBe(2)
    expect(jestFn).toBeCalledTimes(1);

    // jestFn中的依赖项发生改变时，jestFn依旧不执行；
    foo.value = 2
    expect(jestFn).toBeCalledTimes(1);
     // 只有再次读取时，才执行拿到最新的值
    expect(computedValue.value).toBe(3)
    expect(jestFn).toBeCalledTimes(2);
  })
})
