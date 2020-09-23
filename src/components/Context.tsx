import * as React from 'react';

export const UseDBReactContext: any = /*#__PURE__*/ React.createContext(null);

if (process.env.NODE_ENV !== 'production') {
  UseDBReactContext.displayName = 'UseDBReact';
}

export default UseDBReactContext;
