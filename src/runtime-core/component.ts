import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandler } from "./componentPublicIinstance"

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  }

  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
    // TODO: this
    // 将vnode上的props直接挂到instance上
    initProps(instance, instance.vnode.props)
    // initSlots

    setupStatefulComponent(instance) // 处理有状态的组件
}

function setupStatefulComponent(instance) {
  // 在一开始时 先只需要处理setup 拿到setup的返回值就可以了
  const Component = instance.type
  console.log('instance--', instance)

  instance.proxy = new Proxy(
  //   {},
  //   {
  //   get(target, key) {
  //     const { setupState } = instance
  //     if (key in setupState) {
  //       return setupState[key]
  //     }
  //     if (key === '$el') {
  //       return instance.vnode.el
  //     }
  //   }
  // }
  {_: instance},
  PublicInstanceProxyHandler,
  )


  const { setup } = Component

  if (setup) {
    // setup可以返回function 也可以返回object
    // 如果返回function 就说明返回的也是一个render函数。
    // 如果是object 就把该对象注入的组件的上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
    // function Object
    // TODO：function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;

    }

    finishCOmponentSetup(instance)
}

function finishCOmponentSetup(instance: any) {
  // 原本type是在实例的虚拟节点内，为了方便，在初始化实例时，挂载上type// createComponentInstance
  const Component = instance.type
  // if (Component.render) {
    instance.render = Component.render
  // }
}

