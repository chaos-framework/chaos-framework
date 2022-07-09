import { Breadcrumbs } from '@blueprintjs/core';
import { FC } from 'react';
import { Window as IWindow } from '../../../Store/Navigation/index.js';
import EntityList from '../../Entities/EntityTable/EntityTable.js';
import './Window.scss';

export const Window: FC<IWindow> = (props: IWindow) => {
  const { history, currentPlaceInHistory } = props;
  const { name, pageType, props: currentPageProps } = currentPlaceInHistory;

  // Determine what page type to render
  let innerPage: any = 'Page not found.';
  switch (pageType) {
    case 'entityList':
      innerPage = <EntityList />;
      break;
    case 'entity':
      innerPage = <EntityList />;
      break;
  }

  return (
    <div className="Window">
      <Breadcrumbs
        minVisibleItems={1}
        items={[
          { icon: 'document', text: 'image.jpg' },
          { icon: 'document', text: 'image.jpg' }
        ]}
      />
      {innerPage}
    </div>
  );
};
