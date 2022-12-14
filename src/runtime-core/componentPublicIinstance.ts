import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    // $data
    // $options
};


export const PublicInstanceProxyHandler = {

    get({_: instance}, key) {
        const { setupState, props } = instance
        // if (key in setupState) {
        //   return setupState[key]
        // }
        // if (key in props) {
        //   return props[key]
        // }
        if (hasOwn(setupState, key)) {
          return setupState[key]
        } else if (hasOwn(props,key)) {
          return props[key]
        }

        // if (key === '$el') {
        //   return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
      }
}
