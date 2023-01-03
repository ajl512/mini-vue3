import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 就是去调用patch方法，后续方便做递归处理
    patch(vnode, container)
}

function patch(vnode, container) {
    // 去处理组件
    // 判断虚拟节点类型 preocessComponent / processElement
    // 判断是不是element
    if (typeof vnode.type === 'object')
    processComponent(vnode, container)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  // subTree 就是 h('div',this.msg)
  // 基于虚拟节点
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}

