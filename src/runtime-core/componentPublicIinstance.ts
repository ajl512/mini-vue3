const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    // $data
    // $options
};


export const PublicInstanceProxyHandler = {

    get({_: instance}, key) {
        const { setupState } = instance
        if (key in setupState) {
          return setupState[key]
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
