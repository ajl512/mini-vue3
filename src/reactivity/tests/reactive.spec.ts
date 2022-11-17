import { reactive } from '../reactive';
describe('reactive', () => {
  it("happy path", () => {
    const original = { a: 1 };
    const obveserd = reactive(original);
    expect(obveserd).not.toBe(original);
    expect(obveserd.a).toBe(1);
  })
})
