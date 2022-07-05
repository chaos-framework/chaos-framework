import { FC } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

const component: FC = () => {
  return (
    <div className="bp4-dark">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Chaos</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="settings" text="Server" />
          <Button className="bp4-minimal" icon="flag" text="Teams" />
          <Button className="bp4-minimal" icon="people" text="Players" />
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="new-grid-item" text="Entities" />
        </Navbar.Group>
      </Navbar>
    </div>
  );
};

export default component;
