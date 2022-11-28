1. 调用effect时，传入fn, 执行fn, 返回runner; 期待再执行runner时，是再次调用fn;
```js
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
```
因此改effect函数
```js
export function effect(fn) {
  
  const _effect = new ReactiveEffect(fn)
  // 进来就要先执行一次
  _effect.run()

  // 接着要返回runner，因为里面涉及this,所以要用`bind`绑定this
  // 要取返回的runner,所以ReactiveEffect的`run`应该被return
  return _effect.run.bind(_effect)
}
```

```ts
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // activeEffect附值必须在调用之前； 否则在触发依赖收集时，拿到的当前执行体为undefined
    activeEffect = this
    // 要return
    return this._fn()
  }
}

```
