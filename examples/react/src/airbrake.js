import React, { Component } from 'react';
import AirbrakeClient from 'airbrake-js';


let airbrakeClient;

export function notify(err) {
  if (!airbrakeClient) {
    airbrakeClient = new AirbrakeClient({projectId: 1, projectKey: 'FIXME'});
  }
  airbrakeClient.notify(err);
}

export default class AirbrakeComponent extends Component {
  render() {
    try {
      return this.unsafeRender();
    } catch (err) {
      notify(err);
      return <p>{String(err)}</p>;
    }
  }

  unsafeRender() {
    throw new Error('Abstract method unsafeRender not implemented');
  }
}
