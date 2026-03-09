

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * 
 * @param {Element} container 
 * @param {React.Component} Component 
 * @param {Object} props 
 */
export const mount = (container, Component, props = {}) => {
  ReactDOM.render(<Component {...props} />, container);
};

/**
 * 
 * @param {Element} container -
 */
export const unmount = (container) => {
  ReactDOM.unmountComponentAtNode(container);
};