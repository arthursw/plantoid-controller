import React, { Component } from 'react';
import { Interpolation } from './Interpolation'

import * as dg from 'dis-gui';

export class GradientInterpolation extends Interpolation {

  speedScale = 300
  frequencyScale = 1
  
  constructor(props) {
    super(props)

    this.stops = [
      {red: 255, green: 255, blue: 255, stop: 0},
      {stop: 0.3177083333333333, red: 255, green: 84, blue: 0},
      {red: 255, green: 255, blue: 0, stop: 0.5},
      {stop: 0.7239583333333334, red: 178, green: 0, blue: 0},
      {red: 255, green: 255, blue: 255, stop: 1}
    ];

    this.state = {
      frequency: 0.1,
      speed: 0.1,
      mask: '[]'
    };
  }

  computeValues(i, nLeds) {
      if(this.mustIgnore(i)) {
        return [0, 0, 0];
      }

      let frequency = this.state.frequency * this.frequencyScale;
      let speed = this.state.speed;

      let type = this.state.type;

      let time = Date.now() * 0.001 * (speed * this.speedScale);
      
      let t = ( (time + (i / nLeds) * frequency) % 100 ) / 100;
      
      let stops = [...this.stops];
      if(stops[0].stop > 0) {
        stops = [stops[0], ...stops];
        stops[0].stop = 0;
      }
      let prevStop = stops[0];
      let stopFound = false;
      let values = [];
      for(let stop of stops) {
        if(stop.stop > t) {
          let f = (t - prevStop.stop) / (stop.stop - prevStop.stop) ;

          for(let c of ['red', 'green', 'blue']) {
            let color = prevStop[c] * (1-f) + stop[c] * f;
            values.push(color/255);
          }
          stopFound = true;
          break;
        }
        prevStop = stop;
      }
      if(!stopFound) {
        let lastColor = stops[stops.length-1];
        values.push(lastColor.red, lastColor.green, lastColor.blue);
      }

      return values;
  }

  render() {

    return (
      <React.Fragment>
        <dg.Gradient label='Gradient' expanded={true} stops={this.stops} onFinishChange={ (value)=> {
          this.stops = value;
        }}/>
        <dg.Number label='Frequency' min={0} max={1000} value={this.state.frequency} onChange={(value)=> {
            this.setState({frequency: value})}
        }/>
        <dg.Number label='Speed' min={0} max={1} value={this.state.speed} onChange={(value)=> this.setState({speed: value})}/>
        { this.renderMask() }
      </React.Fragment>
    );
  }
}