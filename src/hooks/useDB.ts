import { useEffect, useState, useContext } from 'react';
import { Connection, QueryData, md5 } from '@usedb/core';
import UseDBReactContext from '../components/Context';

type UseDBMap = Map<string, Array<Function>>;

const callQuery = (
  connection: Connection,
  useDBMap: UseDBMap,
  queryObj: QueryData,
  setStatus: Function,
  hardFetch: boolean = false,
  params?: { refetchQueries?: Array<QueryData> }
) => {
  setStatus({ loading: true });
  let cancel = false;
  connection.query(queryObj, hardFetch).then(
    (res: any) => {
      if (cancel) return;
      if (params && params.refetchQueries) {
        performRefetch(connection, useDBMap, params.refetchQueries);
      } else {
        setStatus({ loading: false, data: res });
      }
    },
    (error: Error) => {
      if (cancel) return;
      setStatus({ loading: false, error });
    }
  );
  return () => {
    cancel = true;
  };
};

const updateUseDBMap = (
  dBMap: UseDBMap,
  query: QueryData,
  callback: Function
) => {
  let hashedQuery = md5(JSON.stringify(query));
  let hashMap = dBMap.get(hashedQuery);
  if (hashMap) {
    hashMap.push(callback);
  } else {
    dBMap.set(hashedQuery, [callback]);
  }
};
const performRefetch = (
  connection: Connection,
  useDBMap: UseDBMap,
  queries: Array<QueryData>
) => {
  queries.forEach((query: QueryData) => {
    let useDBMapCallbacks: Array<Function> | undefined = useDBMap.get(
      md5(JSON.stringify(query))
    );
    if (useDBMapCallbacks) {
      useDBMapCallbacks.forEach((callback: Function) => {
        callQuery(connection, useDBMap, query, callback, true);
      });
    }
  });
};
type IStatus = {
  loading: boolean;
  error: Error | undefined;
  data: any;
};
export function useDB(
  queryData?: QueryData,
  commonParams?: { refetchQueries: Array<QueryData> }
) {
  let storedQueryData = queryData;
  const {
    connection,
    useDBMap,
  }: {
    connection: Connection;
    useDBMap: UseDBMap;
  } = useContext(UseDBReactContext);
  const [status, setStatus] = useState<IStatus>({
    loading: false,
    data: undefined,
    error: undefined,
  });
  function refetch() {
    if (storedQueryData) {
      setQuery(storedQueryData, {}, true);
    }
  }

  function setQuery(
    queryObj: QueryData,
    params?: { refetchQueries?: Array<QueryData> },
    hardFetch: boolean = false
  ) {
    storedQueryData = queryObj;
    updateUseDBMap(useDBMap, queryObj, setStatus);
    callQuery(connection, useDBMap, queryObj, setStatus, hardFetch, params);
  }

  useEffect(() => {
    if (queryData) {
      setQuery(queryData, commonParams, false);
    }
  }, []);
  return { ...status, setQuery, refetch };
}
