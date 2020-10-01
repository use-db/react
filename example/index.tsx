import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { db, Connection, RuntimeBinding } from '@usedb/core';
import { useDB, DBProvider } from '../.';
import Todo from './Todo';
const connection = new Connection({ bind: new RuntimeBinding() });
const App = () => {
  return (
    <DBProvider connection={connection}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Todo />
      </div>
    </DBProvider>
  );
};
function Root() {
  React.useEffect(() => {
    async function setDBData() {
      await connection.query(
        db.users.create({
          data: {
            id: 1,
            name: 'user1',
            email: 'user1@email.com',
          },
        })
      );
      setDBLoaded(true);
    }

    setDBData();
  }, []);
  let [dbLoaded, setDBLoaded] = React.useState(false);
  return <div>{dbLoaded ? <DataRenderer /> : null}</div>;
}
function DataRenderer() {
  let { loading, data, error, setQuery } = useDB();
  return (
    <div>
      {loading
        ? 'Loading...'
        : // @ts-ignore
          JSON.stringify(data)}
      <button
        onClick={() => {
          setQuery(
            db.users.create({
              data: { id: 2, name: 'user2', email: 'user2@email.com' },
            }),
            {
              refetchQueries: [
                db.users.findMany({
                  where: {},
                }),
              ],
            }
          );
        }}
      >
        Add more
      </button>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById('root'));
