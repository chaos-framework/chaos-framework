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
            tabs: [
              {
                id: 'admin',
                title: 'Admin',
                content: <div>hey</div>
              }
            ]
          }
        ]
      }
    ]
  }
};
export default defaultLayout;
