import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  setup(props, { emit }) {
    // 1. setup接收props
    // 2. 能被this.count获取值
    // 3. 不能被改变 也就是readonly -> 更准确是shallowReadonly
    // props.count++ // error
    const emitAdd = () => {
      emit('add', 1, 2)
      emit('add-foo', 1, 2)
    }
    return {
      emitAdd
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'emitAdd')
    const foo =  h("div",{}, 'foo:')
    return (
      h("div",{}, [foo, btn])
    )
  }
}
