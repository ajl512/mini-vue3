import { isReadonly, shallowReadonly } from "../reactive";

describe('shallowReadonly', () => {
  test('should not make none-reactive properies reactive', () => {
    const props = shallowReadonly({ a: 1, b: { c: 3}});
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.a)).toBe(false);
    expect(isReadonly(props.b)).toBe(false)
  })

  it("happy path", () => {
    console.warn = jest.fn()
    const wrapped = shallowReadonly({ a: 1 });
    wrapped.a = 2;
    expect(console.warn).toHaveBeenCalled()
  })
})
