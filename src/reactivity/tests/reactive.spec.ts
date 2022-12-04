import { isReactive, reactive } from '../reactive';
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
  })
})
