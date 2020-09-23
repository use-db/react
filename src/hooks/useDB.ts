import { useEffect, useState, useContext } from 'react';
import UseDBReactContext from '../components/Context';

export function useDB(queryJSON?: any) {
  const connection: any = useContext(UseDBReactContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState();
  const setQuery = (queryObj: any) => {
    setLoading(true);
    let cancel = false;
    connection.query(queryObj).then(
      (res: any) => {
        if (cancel) return;
        setLoading(false);
        setData(res);
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
  if (queryJSON) {
    useEffect(() => {
      setQuery(queryJSON);
    }, []);
  }
  return { loading, error, data, setQuery };
}
