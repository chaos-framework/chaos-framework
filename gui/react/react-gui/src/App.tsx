import { ComponentQuery, EntityQuery } from '@chaos-framework/api';
import { useChaos, useChaosAPI, WebGL2DRenderer } from '@chaos-framework/react-lib';

import { Container, Row, Col, Card } from 'react-bootstrap';
import './App.css';

const EntityList = (props: any) => {
  const api = useChaosAPI();
  const [entities, query] = useChaos(api.entities());
  return (
    <div>
      {query.map(([key, subquery]: any) => (
        <EntityView key={key} query={subquery} />
      ))}
      {'' + entities.size}
    </div>
  );
};

const EntityView = (props: { query: EntityQuery }) => {
  const [name] = useChaos(props.query.name());
  const [, componentsSubQuery] = useChaos(props.query.components());
  return (
    <Card>
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        {componentsSubQuery.map(([key, q]) => (
          <ComponentView key={key} query={q} />
        ))}
      </Card.Body>
    </Card>
  );
};

const ComponentView = (props: { query: ComponentQuery }) => {
  const [name] = useChaos(props.query.name());
  const [description] = useChaos(props.query.description());
  return (
    <div>
      {name}
      {description}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={8}>
            <WebGL2DRenderer />
          </Col>
          <Col md={4}>
            <EntityList />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
