'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null
    };
    return vnode;
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; }
};
var PublicInstanceProxyHandler = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        // if (key === '$el') {
        //   return instance.vnode.el
        // }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

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
    { _: instance }, PublicInstanceProxyHandler);
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
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    var proxy = instance.proxy;
    // 不用proxy代理劫持时，调用render,里面的this.msg中的this指向instance,要拿msg，就得是this.setupState.msg才行； 为了方便操作
    // 用proxy代理劫持，只要是获取值时，就从setupState中获取
    var subTree = instance.render.call(proxy);
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
    patch(subTree, container);
    // 处理时机应该是所有的element类型都被mount之后
    // subTree是组件实例调用render所得，是当前render-> this，而不是里面嵌套的
    vnode.el = subTree.el;
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
    // 尝试将el存储起来 有多个h会有多个el; 但是只有type为div,id为root的才是render的得到的第一层里的el会被最终$el读取
    var el = (vnode.el = document.createElement(type)); // type
    console.log('赋值给vnode', vnode, vnode.el);
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
