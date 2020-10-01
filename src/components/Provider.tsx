import React, { ReactChildren, ReactChild } from 'react';
import { UseDBReactContext } from './Context';
import { Connection } from '@usedb/core';

export function Provider({
  connection,
  children,
}: {
  connection: Connection;
  children: ReactChildren | ReactChild;
}) {
  return (
    <UseDBReactContext.Provider
      value={{ connection, useDBMap: new Map<string, Array<Function>>() }}
    >
      {children}
    </UseDBReactContext.Provider>
  );
}
