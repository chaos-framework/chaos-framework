import { FC } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

import { entityListTabFactory } from '../Tab/tabFactory.js';
import DockLayout from 'rc-dock';
import { useAppSelector } from '../../../Store/hooks.js';

interface NavbarProps {
  dock?: DockLayout;
}

const component: FC<NavbarProps> = (props: NavbarProps) => {
  if (props.dock === undefined) {
    return <span>Loading.</span>;
  }

  return (
    <div className="bp4-dark">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Chaos Admin</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="settings" text="Server" />
          <Button className="bp4-minimal" icon="application" text="Game" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="flag" text="Teams" />
          <Button className="bp4-minimal" icon="people" text="Players" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="globe" text="Worlds" />
          <Button
            className="bp4-minimal"
            icon="new-grid-item"
            text="Entities"
            onClick={() => props.dock?.dockMove(entityListTabFactory(), 'main', 'middle')}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp4-minimal" icon="code" text="IDE" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="console" text="Output" />
          <Button className="bp4-minimal" icon="time" text="Timeline" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="search" text="Search" />
          <Button className="bp4-minimal" icon="eye-open" text="Preview" />
        </Navbar.Group>
      </Navbar>
    </div>
  );
};

export default component;
