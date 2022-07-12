import { LayoutData } from 'rc-dock';

const defaultLayout: LayoutData = {
  dockbox: {
    mode: 'horizontal',
    children: [
      {
        id: 'main',
        mode: 'vertical',
        size: 200,
        panelLock: {
          minWidth: 200,
          widthFlex: 20
        },
        children: [
          {
            id: 'main',
            tabs: [
              {
                id: 'admin',
                title: 'Admin',
                content: <div>Connected</div>,
                closable: true
              }
            ],
            panelLock: {}
          }
        ]
      }
    ]
  }
};
export default defaultLayout;
