import React, { Component } from 'react';
import update from 'immutability-helper';

import * as dg from 'dis-gui';

export class Interpolation extends Component {


  constructor(props) {
    super(props)
    this.state = {
      mask: '[]'
    };
  }

  componentDidMount() {
    this.props.init( (i, nLeds)=> this.computeValues(i, nLeds), (i)=> this.toggleMask(i) );
  }

  getMask() {
    let mask = [];
    try {
      mask = JSON.parse(this.state.mask);
    } catch (e) {

    }
    return mask;
  }

  mustIgnore(i) {
    let mask = this.getMask();
    return mask.indexOf(i) >= 0
  }

  computeValues(i, nLeds) {
      return [];
  }

  toggleMask(i) {
    let mask = this.getMask();

    let index = mask.indexOf(i);
    
    if(index >= 0) {
      mask = mask.splice(index, 1);
    } else {
      mask.push(i);
    }

    this.setState({'mask': JSON.stringify(mask)})
  }

  renderMask() {
    return (
      <dg.Text label='Mask' value={this.state.mask} onChange={(value)=> this.setState({mask: value})} />
      );
  }

  render() {

    return (
      <React.Fragment>
      </React.Fragment>
    );
  }
}