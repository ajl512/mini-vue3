import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  setup(props) {
    // 1. setup接收props
    // 2. 能被this.count获取值
    // 3. 不能被改变 也就是readonly -> 更准确是shallowReadonly
    props.count++ // error
  },
  render() {
    return (
      h("div",{}, 'foo:'+ this.count)
    )
  }
}
