import React, { ReactChildren, ReactChild } from 'react';
import { UseDBReactContext } from './Context';

export function Provider({
  connection,
  children,
}: {
  connection: any;
  children: ReactChildren | ReactChild;
}) {
  return (
    <UseDBReactContext.Provider value={connection}>
      {children}
    </UseDBReactContext.Provider>
  );
}
