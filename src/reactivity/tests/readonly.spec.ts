import { readonly } from '../reactive';
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
})
