import { isReadonly, readonly, isProxy } from '../reactive';
describe('readonly', () => {
  it("happy path", () => {
    const original = { a: 1 };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.a).toBe(1);
    console.warn = jest.fn()
    wrapped.a = 2;
    expect(console.warn).toBeCalled()
  })

  it('isReadonly', () => {
    const original = { a: 1 };
    const obveserd = readonly(original);
    expect(isReadonly(obveserd)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isProxy(obveserd)).toBe(true)
  })
})
