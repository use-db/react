import { useEffect, useState, useContext } from 'react';
import UseDBReactContext from '../components/Context';

export function useDB(queryJSON: any) {
  const connection: any = useContext(UseDBReactContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [res, setRes] = useState();
  useEffect(() => {
    setLoading(true);
    let cancel = false;
    connection.query(queryJSON).then(
      (res: any) => {
        if (cancel) return;
        setLoading(false);
        setRes(res);
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
  }, []);
  return { loading, error, res };
}
