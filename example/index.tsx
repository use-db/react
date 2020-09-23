import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { db, Connection, RuntimeBinding } from '@usedb/core';
import { useDB, DBProvider } from '../.';
const connection = new Connection({ bind: new RuntimeBinding() });
const App = () => {
  return (
    <DBProvider connection={connection}>
      <Root />
    </DBProvider>
  );
};
function Root() {
  React.useEffect(() => {
    async function setDBData() {
      await connection.query(
        db.users
          .insert({
            id: 1,
            name: 'user1',
            email: 'user1@email.com',
          })
          .toJS()
      );

      setDBLoaded(true);
    }

    setDBData();
  }, []);
  let [dbLoaded, setDBLoaded] = React.useState(false);
  return <div>{dbLoaded ? <DataRenderer /> : null}</div>;
}
function DataRenderer() {
  let { loading, data, error } = useDB(db.users.find(2).toJS());
  console.log('*** 🔥res,', loading, data, error);
  // // @ts-ignore
  let { setQuery } = useDB();
  return (
    <div>
      {loading
        ? 'Loading...'
        : // @ts-ignore
          data?.name}
      <button
        onClick={() =>
          setQuery(
            db.users
              .insert({ id: 2, name: 'user2', email: 'user2@email.com' })
              .toJS()
          )
        }
      >
        Add more
      </button>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById('root'));
