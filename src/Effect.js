import React, { Component } from 'react';

import { ColorInterpolation } from './ColorInterpolation';
import { GradientInterpolation } from './GradientInterpolation';

import * as dg from 'dis-gui';

export class Effect extends Component {

  constructor(props) {
    super(props)
    this.state = {
      type: this.props.type
    };
  }

  renderEffect() {
    if(this.state.type == 'Color interpolation') {
      return ( <ColorInterpolation init={ this.props.init }/> )
    } else if (this.state.type == 'Gradient interpolation') {
      return ( <GradientInterpolation init={ this.props.init }/> )
    }
  }

  render() {

    return (
      <React.Fragment>
        <dg.Select label='Form' value={this.state.type} options={['Color interpolation', 'Gradient interpolation']} onChange={(value)=> this.setState({'type': value})}/>
        { this.renderEffect() }
      </React.Fragment>
    );
  }
}