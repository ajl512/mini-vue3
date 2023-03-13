import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  // 平时我们写的是.vue类的文件 <template></template>
  // 这是需要有编译功能的
  // 这里暂时不考虑这个 我们用render函数‘ template最终其实也会被编译成render函数被其处理
  render() {
    window.self = this
    // 返回虚拟节点
    return h('div',{
      id: 'root',
      class: ['red', 'blue'],
      onClick() {
        console.log('on tap click')
      }
    },
    // setupState
    // 'hi,' +  this.msg
    // this.$el 拿到组件的根节点； 这里面就#root
    [
      h("p", { class: 'red'}, "hi"),
      h("p", { class: 'blue'}, "mini-vue"),
      h(Foo, {
        onAdd(a, b) {
          console.log('a, b', a, b)
      } }, 'xxx'),
    ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue 哈哈哈'
    }
  },
}
