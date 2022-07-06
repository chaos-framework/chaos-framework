import { FC } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

const component: FC = () => {
  return (
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
        <Button className="bp4-minimal" icon="new-grid-item" text="Entities" />
        <Button className="bp4-minimal" icon="globe" text="Worlds" />
      </Navbar.Group>
    </Navbar>
  );
};

export default component;
