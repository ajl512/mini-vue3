import { isReactive, reactive, isProxy, proxyRefs } from '../reactive';
import { ref } from '../ref';
describe('reactive', () => {
  it("happy path", () => {
    const original = { a: 1 };
    const obveserd = reactive(original);
    expect(obveserd).not.toBe(original);
    expect(obveserd.a).toBe(1);
  })

  it('isReactive', () => {
    const original = { a: 1, user: { name: 'zhang san'}, array: [{ info: { age: 1}}] };
    const obveserd = reactive(original);
    expect(isReactive(obveserd)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(obveserd.user)).toBe(true)
    expect(isReactive(obveserd.array)).toBe(true)
    expect(isReactive(obveserd.array[0])).toBe(true)
    expect(isProxy(obveserd)).toBe(true)
  })

  it('proxyRefs', ()=> {
    // 主要用于 setup return { a: 1, b: ref(2)} 将改值处理，
    // 在templete语法中使用时，可以直接使用a,b，而不是b.value;
    // 同时要支持在模版中 给b = c;/ b = a时，能改变origin中的值
    const origin = {
      a: 1,
      b: ref(2),
      c: ref(3),
    }
    const proxyObj = proxyRefs(origin)
    expect(proxyObj.a).toBe(1)
    expect(proxyObj.b).toBe(2)
    expect(origin.b.value).toBe(2)

    proxyObj.b = 10
    expect(proxyObj.b).toBe(10)
    expect(origin.b.value).toBe(10)

    proxyObj.b = ref(11)
    expect(proxyObj.b).toBe(11)
    expect(origin.b.value).toBe(11)

    proxyObj.a = 12
    expect(proxyObj.a).toBe(12)
    expect(origin.b.value).toBe(11)
  })
})
