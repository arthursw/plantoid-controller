import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { ColorInterpolation } from './ColorInterpolation';
import { GradientInterpolation } from './GradientInterpolation';
import { Effect } from './Effect';

import update from 'immutability-helper';

import {main} from './main.js';

import * as dg from 'dis-gui';

class App extends Component {
  constructor(props) {
    super(props)
    this.nameToComputeValues = {};
    this.nameToToggleMask = {};
  }


  componentDidMount() {
    main(this);
  }

  computeValues(stripName, i, nLeds) {
    if(this.nameToComputeValues[stripName] != null) {
      return this.nameToComputeValues[stripName](i, nLeds);
    }
    return [];
  }

  toggleMask(stripName, i) {
    if(this.nameToToggleMask[stripName] != null) {
      return this.nameToToggleMask[stripName](i);
    }
    return [];
  }

  initEffect(name) {
    return (computeValues, toggleMask)=> {
      this.nameToComputeValues[name] = computeValues
      this.nameToToggleMask[name] = toggleMask
    }
  }


  render() {

    return (
      <div className="App">

        <div className="gui-container">
          <dg.GUI>

            <dg.Folder label='Led strip left' expanded={true}>
              <Effect type='Gradient interpolation' init={ this.initEffect('led-strip-l') } />
            </dg.Folder>
            <dg.Folder label='Led strip right' expanded={true}>
              <Effect type='Gradient interpolation' init={ this.initEffect('led-strip-r') } />
            </dg.Folder>

            <dg.Folder label='Led strip stem left' expanded={false}>
              <Effect type='Gradient interpolation' init={ this.initEffect('led-strip-stem-l') } />
            </dg.Folder>
            <dg.Folder label='Led strip stem right' expanded={false}>
              <Effect type='Gradient interpolation' init={ this.initEffect('led-strip-stem-r') } />
            </dg.Folder>

            <dg.Folder label='Led strip leaf left' expanded={false}>
              <Effect type='Color interpolation' init={ this.initEffect('led-strip-leaf-l') } />
            </dg.Folder>
            <dg.Folder label='Led strip leaf right' expanded={false}>
              <Effect type='Color interpolation' init={ this.initEffect('led-strip-leaf-r') } />
            </dg.Folder>

            <dg.Folder label='Led strip petals' expanded={false}>
              <Effect type='Color interpolation' init={ this.initEffect('led-strip-petals') } />
            </dg.Folder>
            
          </dg.GUI>
        </div>

      </div>
    );
  }
}

export default App;
