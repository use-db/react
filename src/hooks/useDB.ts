import { useEffect, useState, useContext } from 'react';
import UseDBReactContext from '../components/Context';

const callQuery = (
  connection: any,
  queryObj: any,
  setLoading: any,
  setData: any,
  setError: any,
  params?: { refetchQueries: Array<any> }
) => {
  setLoading(true);
  let cancel = false;
  connection.query(queryObj).then(
    (res: any) => {
      if (cancel) return;
      if (params && params.refetchQueries) {
        // make it a loop and use Promise.all
        callQuery(
          connection,
          params.refetchQueries,
          setLoading,
          setData,
          setError
        );
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
export function useDB(
  queryJSON?: any,
  commonParams?: { refetchQueries: any } // TODO: can make it an array
) {
  const connection: any = useContext(UseDBReactContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState();
  const setQuery = (queryObj: any, params?: { refetchQueries: any }) =>
    callQuery(connection, queryObj, setLoading, setData, setError, params);
  if (queryJSON) {
    useEffect(() => {
      callQuery(
        connection,
        queryJSON,
        setLoading,
        setData,
        setError,
        commonParams
      );
    }, []);
  }
  return { loading, error, data, setQuery };
}
