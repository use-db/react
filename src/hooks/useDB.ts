import { useEffect, useState, useContext } from 'react';
import UseDBReactContext from '../components/Context';

export interface QueryData {
  collection: string;
  operation: string;
  payload: any;
}

const callQuery = (
  connection: any,
  queryObj: QueryData,
  setLoading: any,
  setData: any,
  setError: any,
  params?: { refetchQueries: Array<QueryData> }
) => {
  setLoading(true);
  let cancel = false;
  connection.query(queryObj).then(
    (res: any) => {
      if (cancel) return;
      if (params && params.refetchQueries) {
        performRefetch(connection, params.refetchQueries);
      } else {
        setLoading(false);
        setData(res);
      }
    },
    (error: Error) => {
      if (cancel) return;
      setLoading(false);
      setError(error);
    }
  );
  return () => {
    cancel = true;
  };
};

type StoredCallbacks = { setLoading: any; setData: any; setError: any };
const queryCache: Map<string, Array<StoredCallbacks>> = new Map();
const updateQueryCache = (query: QueryData, callbacks: StoredCallbacks) => {
  const stringified = JSON.stringify(query);
  let cachedCallbacks = queryCache.get(stringified);
  if (cachedCallbacks) {
    cachedCallbacks.push(callbacks);
  } else {
    queryCache.set(stringified, [callbacks]);
  }
};
const performRefetch = (connection: any, queries: Array<QueryData>) => {
  queries.forEach((query: QueryData) => {
    const stringified = JSON.stringify(query);
    let cachedCallbacks: Array<StoredCallbacks> | undefined = queryCache.get(
      stringified
    );
    if (cachedCallbacks) {
      cachedCallbacks.forEach((callback: StoredCallbacks) => {
        callQuery(
          connection,
          query,
          callback.setLoading,
          callback.setData,
          callback.setError
        );
      });
    }
  });
};
export function useDB(
  queryData?: QueryData,
  commonParams?: { refetchQueries: Array<QueryData> }
) {
  const connection: any = useContext(UseDBReactContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState();
  function setQuery(
    queryObj: any,
    params?: { refetchQueries: Array<QueryData> }
  ) {
    updateQueryCache(queryObj, { setLoading, setData, setError });
    callQuery(connection, queryObj, setLoading, setData, setError, params);
  }

  if (queryData) {
    useEffect(() => {
      setQuery(queryData, commonParams);
    }, []);
  }
  return { loading, error, data, setQuery };
}
