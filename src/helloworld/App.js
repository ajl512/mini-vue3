import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  // 平时我们写的是.vue类的文件 <template></template>
  // 这是需要有编译功能的
  // 这里暂时不考虑这个 我们用render函数‘ template最终其实也会被编译成render函数被其处理
  render() {
    // 返回虚拟节点
    return h('div',{
      id: 'root',
      class: ['red', 'blue']
    },
    // 'hi,' +  'mini-vue'
    [
      h("p", { class: 'red'}, "hi"),
      h("p", { class: 'blue'}, "mini-vue"),

    ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  },
}
