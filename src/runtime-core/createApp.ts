import { createVNode } from "./vnode"
import { render } from './renderer';

export function createApp (rootComponent) {
    return {
        // rootContainer根容器
        mount(rootContainer) {
            // 把所有的东西转换成vnode
            // 后续素有的逻辑操作都会基于 vnode 做处理
            // component -> vnode
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
}

