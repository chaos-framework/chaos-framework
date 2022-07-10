import { FC } from 'react';

import { Model, Layout } from 'flexlayout-react';

import initialModel from './initialModel.js';
import tabFactory from './tabFactory.js';

import './GUI.scss';

const model = Model.fromJson(initialModel);

const GUI: FC<any> = (props: any) => {
  return (
    <div className="GUI">
      {/* <Navbar /> */}
      <Layout model={model} factory={tabFactory} />
    </div>
  );
};

export default GUI;
