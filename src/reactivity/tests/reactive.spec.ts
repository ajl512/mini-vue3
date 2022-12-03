import { isReactive, reactive } from '../reactive';
describe('reactive', () => {
  it("happy path", () => {
    const original = { a: 1 };
    const obveserd = reactive(original);
    expect(obveserd).not.toBe(original);
    expect(obveserd.a).toBe(1);
  })

  it('isReactive', () => {
    const original = { a: 1 };
    const obveserd = reactive(original);
    expect(isReactive(obveserd)).toBe(true)
    expect(isReactive(original)).toBe(false)
  })
})
