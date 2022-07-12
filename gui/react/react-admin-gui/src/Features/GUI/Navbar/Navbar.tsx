import { FC } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

import { entityListTabFactory } from '../Tab/tabFactory.js';
import DockLayout from 'rc-dock';
import { useAppSelector } from '../../../Store/hooks.js';
import { getDockRef } from '../guiSlice.js';

interface NavbarProps {
  dock: any;
}

const component: FC<NavbarProps> = (props: NavbarProps) => {
  const dockRef = useAppSelector(getDockRef);
  console.log(dockRef);
  console.log(dockRef);

  return (
    <div className="bp4-dark">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Chaos</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="settings" text="Server" />
          <Button className="bp4-minimal" icon="application" text="Game" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="flag" text="Teams" />
          <Button className="bp4-minimal" icon="people" text="Players" />
          <Navbar.Divider />
          <Button
            className="bp4-minimal"
            icon="new-grid-item"
            text="Entities"
            onClick={() => props.dock.current.dockMove(entityListTabFactory(), 'main', 'middle')}
          />
          <Button className="bp4-minimal" icon="globe" text="Worlds" />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp4-minimal" icon="search" text="Search" />
          <Button className="bp4-minimal" icon="eye-open" text="Preview" />
        </Navbar.Group>
      </Navbar>
    </div>
  );
};

export default component;
