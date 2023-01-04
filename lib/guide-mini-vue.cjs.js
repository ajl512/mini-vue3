'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
        type: vnode.type,
        setupState: {},
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
    instance.proxy = new Proxy({}, {
        get: function (target, key) {
            var setupState = instance.setupState;
            if (key in setupState) {
                return setupState[key];
            }
        }
    });
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
    patch(vnode, container);
}
function patch(vnode, container) {
    // 去处理组件
    // 判断虚拟节点类型 preocessComponent / processElement
    // 判断是不是element
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (typeof vnode.type === 'object') {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var proxy = instance.proxy;
    // 不用proxy代理劫持时，调用render,里面的this.msg中的this指向instance,要拿msg，就得是this.setupState.msg才行； 为了方便操作
    // 用proxy代理劫持，只要是获取值时，就从setupState中获取
    var subTree = instance.render.call(proxy);
    // subTree 就是 h('div',this.msg)
    // 基于虚拟节点
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
}
function processElement(vnode, container) {
    // element类型分为init和
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 看vnode.ts中 vnode = { type, props, chidren }
    // const el = document.createElement('div') // type
    // el.setAttribute('id', 'root') // props
    // // chidren 涉及两种类型 一种string类型； 一种array类型
    // el.textContent = 'hi mini-vue'
    // document.body.appendChild(el);
    var type = vnode.type, props = vnode.props, children = vnode.children;
    var el = document.createElement(type); // type
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (v) {
        patch(v, container);
    });
}

function createApp(rootComponent) {
    return {
        // rootContainer根容器
        mount: function (rootContainer) {
            // 把所有的东西转换成vnode
            // 后续素有的逻辑操作都会基于 vnode 做处理
            // component -> vnode
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
