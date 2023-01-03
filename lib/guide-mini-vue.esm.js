function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
}

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO: this
    // initProps
    // initSlots
    setupStatefulComponent(instance); // 处理有状态的组件
}
function setupStatefulComponent(instance) {
    // 在一开始时 先只需要处理setup 拿到setup的返回值就可以了
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        // setup可以返回function 也可以返回object
        // 如果返回function 就说明返回的也是一个render函数。
        // 如果是object 就把该对象注入的组件的上下文中
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO：function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishCOmponentSetup(instance);
}
function finishCOmponentSetup(instance) {
    // 原本type是在实例的虚拟节点内，为了方便，在初始化实例时，挂载上type// createComponentInstance
    var Component = instance.type;
    // if (Component.render) {
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    // 就是去调用patch方法，后续方便做递归处理
    patch(vnode);
}
function patch(vnode, container) {
    // 去处理组件
    // 判断虚拟节点类型 preocessComponent / processElement
    // 判断是不是element
    if (typeof vnode.type === 'object')
        processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    // subTree 就是 h('div',this.msg)
    // 基于虚拟节点
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        // rootContainer根容器
        mount: function (rootContainer) {
            // 把所有的东西转换成vnode
            // 后续素有的逻辑操作都会基于 vnode 做处理
            // component -> vnode
            var vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
