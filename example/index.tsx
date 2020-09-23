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
async function addUser() {
  return;
}
function Root() {
  React.useEffect(() => {
    connection
      .query(
        db.users
          .insert({
            id: 1,
            name: 'user1',
            email: 'user1@email.com',
          })
          .toJS()
      )
      .then(() => {
        setDBLoaded(true);
      });
  }, []);
  let [dbLoaded, setDBLoaded] = React.useState(false);
  return <div>{dbLoaded ? <DataRenderer /> : null}</div>;
}
function DataRenderer() {
  let { loading, res, error } = useDB(db.users.find(1).toJS());
  console.log('*** 🔥res,', loading, res, error);
  // @ts-ignore
  return <div>{loading ? 'Loading...' : res?.name}</div>;
}
ReactDOM.render(<App />, document.getElementById('root'));
