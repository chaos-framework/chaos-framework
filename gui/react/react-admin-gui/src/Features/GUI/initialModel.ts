import { IJsonModel } from 'flexlayout-react';

export const initialModel: IJsonModel = {
  global: {},
  borders: [
    {
      type: 'border',
      location: 'left',
      children: [
        {
          type: 'tab',
          enableClose: false,
          name: 'Admin',
          component: 'grid'
        }
      ]
    }
  ],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'One',
            component: 'button'
          }
        ]
      },
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'Two',
            component: 'button'
          }
        ]
      }
    ]
  }
};

export default initialModel;
