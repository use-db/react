import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  db,
  Connection,
  RuntimeBinding,
  LocalStorageBinding,
  CloudStorageBinding,
} from '@usedb/core';
import { useDB, DBProvider } from '../.';
import Todo from './Todo';
const connection = new Connection({
  bind: new CloudStorageBinding('http://localhost:3001'),
});
const App = () => {
  return (
    <DBProvider connection={connection}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TodoList />
        <Todo />
      </div>
    </DBProvider>
  );
};

export function TodoList() {
  const allTodos = useDB(db.todos.findMany({ where: {} }));
  return (
    <div style={{ marginRight: 100 }}>
      <span> Read only TODO</span>
      {allTodos.data
        ? allTodos.data.map(todo => {
            return (
              <div key={todo.id} style={{ margin: 10 }}>
                <span
                  style={{
                    textDecoration: `${todo.done ? 'line-through' : 'none'}`,
                  }}
                >
                  {todo.caption}
                </span>
              </div>
            );
          })
        : null}
    </div>
  );
}
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
