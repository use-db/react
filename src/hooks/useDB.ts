import { useEffect, useState, useContext } from 'react';
import { Connection, QueryData, md5 } from '@usedb/core';
import UseDBReactContext from '../components/Context';

type UseDBMap = Map<string, Array<Function>>;

const callQuery = (
  connection: Connection,
  useDBMap: UseDBMap,
  queryObj: QueryData,
  setStatus: Function,
  params?: { refetchQueries: Array<QueryData> }
) => {
  setStatus({ loading: true });
  let cancel = false;
  connection.query(queryObj, true).then(
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
        callQuery(connection, useDBMap, query, callback);
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
  function refetch(query: QueryData) {
    setQuery(query);
  }

  function setQuery(
    queryObj: QueryData,
    params?: { refetchQueries: Array<QueryData> }
  ) {
    updateUseDBMap(useDBMap, queryObj, setStatus);
    callQuery(connection, useDBMap, queryObj, setStatus, params);
  }

  if (queryData) {
    useEffect(() => {
      setQuery(queryData, commonParams);
    }, []);
  }
  return { ...status, setQuery, refetch };
}
