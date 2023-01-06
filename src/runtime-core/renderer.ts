import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createVNode } from "./vnode";

export function render(vnode, container) {
    // 就是去调用patch方法，后续方便做递归处理
    patch(vnode, container)
}

function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 去处理组件
    // 判断虚拟节点类型 preocessComponent / processElement
    // 判断是不是element
    if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(vnode, container)
    }

}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

// initialVNode表示初始化的虚拟节点
function mountComponent(initialVNode: any, container) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance
  // 不用proxy代理劫持时，调用render,里面的this.msg中的this指向instance,要拿msg，就得是this.setupState.msg才行； 为了方便操作
  // 用proxy代理劫持，只要是获取值时，就从setupState中获取
  const subTree = instance.render.call(proxy)
  // subTree 就是h('div', {id: 'root',class:['red', 'blue']}, children: Array(2)})
  // -> 变成vnode结构后的{
  //   type: 'div',
  //   props: {id: 'root',class:['red', 'blue']},
  //   children:Array(2),
  //   el: null
  // }
  // 基于虚拟节点
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
  // 处理时机应该是所有的element类型都被mount之后
  // subTree是组件实例调用render所得，是当前render-> this，而不是里面嵌套的
  initialVNode.el = subTree.el
}

function processElement(vnode: any, container: any) {
  // element类型分为init和
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  // 看vnode.ts中 vnode = { type, props, chidren }
  // const el = document.createElement('div') // type
  // el.setAttribute('id', 'root') // props
  // // chidren 涉及两种类型 一种string类型； 一种array类型
  // el.textContent = 'hi mini-vue'

  // document.body.appendChild(el);

  const { type, props, children, shapeFlag } = vnode
  // 尝试将el存储起来 有多个h会有多个el; 但是只有type为div,id为root的才是render的得到的第一层里的el会被最终$el读取
  const el = (vnode.el =  document.createElement(type)) // type
  for (const key in props) {
    const val = props[key]
    // 注册事件 onClick-> click-> addEventListener('click',val); onMousedown -> mousedown
    // 所以看是否是on+大写字母开头的 就是注册事件；
    const isOn =(key: string): boolean => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event,val)
    } else {
      el.setAttribute(key, val)
    }
  }
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }

  container.appendChild(el)

}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}
