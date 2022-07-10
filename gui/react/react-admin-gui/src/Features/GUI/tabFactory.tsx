import { TabNode } from 'flexlayout-react';

export const tabFactory = (node: TabNode) => {
  var component = node.getComponent();
  // TODO switch based on node requested
  return <div>{node.getName()}</div>;
};

export default tabFactory;
