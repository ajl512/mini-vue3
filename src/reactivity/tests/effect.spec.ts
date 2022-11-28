import { reactive } from '../reactive';
import { effect } from '../effect';
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++;
    expect(nextAge).toBe(12)
  })

  it('should return runner when call effect', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++
      return 'mock res'
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe('mock res')
  })

  it('scheduler', () => {
    // 通过 effect 的第二个参数给定一个scheduler的fn；
    // 第一次时只调用第一个function; 不调用scheduler‘
    // 当响应式对象被set update时，不执行第一个function, 而是调用scheduler的fn
    // 当执行run时，会再次调用第一个funtion
    let run: any;
    let dummy;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({
      foo: 1
    })

    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  })
})
