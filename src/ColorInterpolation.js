import React, { Component } from 'react';
import { Interpolation } from './Interpolation'

import * as dg from 'dis-gui';

export class ColorInterpolation extends Interpolation {

  speedScale = 300
  frequencyScale = 0.15

  constructor(props) {
    super(props)
    this.state = {
      'color1': { red: 0, green: 0, blue: 0 },
      'color2': { red: 250, green: 255, blue: 90 },
      type: 'sine',
      frequency: 0.1,
      speed: 0.1,
      mask: '[]'
    };
  }

  triangle(t) {
    let v = Math.floor( (t / Math.PI) + 0.5 )
    return ( 2 / Math.PI ) * ( t - Math.PI * v ) * Math.pow(-1, v)
  }

  square(t) {
    return Math.sign(Math.sin(t))
  }

  computeValues(i, nLeds) {
      if(this.mustIgnore(i)) {
        return [0, 0, 0];
      }

      let frequency = this.state.frequency * this.frequencyScale;
      let speed = this.state.speed;
      let color1 = this.state.color1;
      let color2 = this.state.color2;
      let type = this.state.type;
      
      let time = Date.now() * 0.001 * (speed * this.speedScale);
      let t = time + i;
      let func = type == 'sine' ? Math.sin : type == 'triangle' ? this.triangle : this.square;
      let value = 0.5 + 0.5 * func(2 * Math.PI * frequency * t);
      let values = [];
      for(let c of ['red', 'green', 'blue']) {
        let color = color1[c] * (1-value) + color2[c] * value;
        values.push(color/255);
      }
      return values;
  }

  render() {

    return (
      <React.Fragment>
        <dg.Color label='Color 1' 
          expanded={true} 
          red={this.state.color1.red} 
          green={this.state.color1.green} 
          blue={this.state.color1.blue} 
          onChange={ (value)=> this.setState( {color1: value} ) } 
        />
        <dg.Color label='Color 2' 
          expanded={true} 
          red={this.state.color2.red} 
          green={this.state.color2.green} 
          blue={this.state.color2.blue} 
          onChange={ (value)=> this.setState( {color2: value} ) } 
        />
        <dg.Select label='Type' value={this.state.type} options={['sine', 'square', 'triangle']} onChange={(value)=> this.setState({type: value})} />
        <dg.Number label='Frequency' min={0} max={1} value={this.state.frequency} onChange={(value)=> this.setState({frequency: value})}/>
        <dg.Number label='Speed' min={0} max={1} value={this.state.speed} onChange={(value)=> this.setState({speed: value})}/>
        { this.renderMask() }
      </React.Fragment>
    );
  }
}