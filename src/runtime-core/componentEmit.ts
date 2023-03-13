import { cameLize, toHandlerKey } from "../shared/index";

export function emit (instance, event, ...args) {
  console.log('emit', event);
  // instance.props -> event
  const { props } = instance
  // TPP开发技巧
  // 先去写一个特定的行为，再重构成通用的行为
  // add -> onAdd
  // add-foo -> onAddFoo


  const handler = props[toHandlerKey(cameLize(event))]
  console.log('点击 handler')
  handler && handler(args);
}
