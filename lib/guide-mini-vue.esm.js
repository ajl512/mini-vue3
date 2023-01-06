function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var hasOwn = function (val, key) { return Object.prototype.hasOwnProperty.call(val, key); };

var targetsMap = new Map();
// 触发依赖
function trigger(target, key) {
    var depsMap = targetsMap.get(target);
    var dep = depsMap.get(key);
    triggerEffets(dep);
}
function triggerEffets(dep) {
    // 遍历set结构
    // 1. for/of; // 2. forEach; // 3. deps.values
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadOnly, isShallowReadonly) {
    if (isReadOnly === void 0) { isReadOnly = false; }
    if (isShallowReadonly === void 0) { isShallowReadonly = false; }
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadOnly;
        }
        var res = Reflect.get(target, key);
        if (isShallowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
var mutableHandles = {
    get: get,
    set: set,
};
var readonlyHandles = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("".concat(key, " can not set ").concat(value, ", because target is readonly"), target);
        return true;
    }
};
var shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
});

// 取名另类 内置属性
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function createActiveObject(raw, basicHandles) {
    return new Proxy(raw, basicHandles);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandles);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandles);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandles);
}

function initProps(instance, props) {
    instance.props = props || {};
    // 后续还要处理attrs
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    // $data
    // $options
};
var PublicInstanceProxyHandler = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        // if (key in setupState) {
        //   return setupState[key]
        // }
        // if (key in props) {
        //   return props[key]
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
        props: {},
    };
    return component;
}
function setupComponent(instance) {
    // TODO: this
    // 将vnode上的props直接挂到instance上
    initProps(instance, instance.vnode.props);
    // initSlots
    setupStatefulComponent(instance); // 处理有状态的组件
}
function setupStatefulComponent(instance) {
    // 在一开始时 先只需要处理setup 拿到setup的返回值就可以了
    var Component = instance.type;
    console.log('instance--', instance);
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
        var setupResult = setup(shallowReadonly(instance.props));
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
    var shapeFlag = vnode.shapeFlag;
    // 去处理组件
    // 判断虚拟节点类型 preocessComponent / processElement
    // 判断是不是element
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// initialVNode表示初始化的虚拟节点
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
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
    initialVNode.el = subTree.el;
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
    var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
    // 尝试将el存储起来 有多个h会有多个el; 但是只有type为div,id为root的才是render的得到的第一层里的el会被最终$el读取
    var el = (vnode.el = document.createElement(type)); // type
    for (var key in props) {
        var val = props[key];
        // 注册事件 onClick-> click-> addEventListener('click',val); onMousedown -> mousedown
        // 所以看是否是on+大写字母开头的 就是注册事件；
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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

export { createApp, h };
