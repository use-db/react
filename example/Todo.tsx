import * as React from 'react';
import { db } from '@usedb/core';
import { useDB } from '../.';
import { maxBy } from 'lodash';

const FETCH_ALL = db.todos.findMany({ where: {} });
let count = 0;
export default function Todo() {
  const allTodos = useDB(FETCH_ALL);
  const addTodo = useDB();
  let maxItem = maxBy(allTodos.data, (todo: any) => todo.id);
  count = maxItem ? maxItem.id : 0;
  if (allTodos.loading) {
    return <div>Loading..</div>;
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <button
        style={{ height: 20, width: 100 }}
        onClick={() => {
          addTodo.setQuery(
            db.todos.create({
              data: { id: ++count, caption: '', done: false },
            }),
            { refetchQueries: [FETCH_ALL] }
          );
          // allTodos.refetch();
        }}
      >
        Add task
      </button>
      {allTodos.data
        ? allTodos.data.map(todo => (
            <TodoItem key={todo.id} todo={todo} refetch={allTodos.refetch} />
          ))
        : null}
    </div>
  );
}

function TodoItem({ todo, refetch }: any) {
  const [value, setValue] = React.useState(todo.caption);
  const updateQuery = useDB();
  const handleChange = (e: any) => {
    e.persist();
    setValue(e.target.value);
  };
  const handleBlur = (e: any) => {
    if (e.keyCode === 13) {
      updateQuery.setQuery(
        db.todos.update({
          where: { id: todo.id },
          data: { ...todo, caption: value },
        }),
        { refetchQueries: [FETCH_ALL] }
      );
    }
  };
  const handleCheck = () => {
    updateQuery.setQuery(
      db.todos.update({
        where: { id: todo.id },
        data: { ...todo, done: !todo.done },
      })
    );
  };
  const removeItem = () => {
    updateQuery.setQuery(
      db.todos.delete({
        where: { id: todo.id },
      }),
      { refetchQueries: [FETCH_ALL] }
    );
    // refetch();
  };
  return (
    <div style={{ margin: 10 }}>
      <input
        style={{ textDecoration: `${todo.done ? 'line-through' : 'none'}` }}
        value={value}
        onChange={handleChange}
        onKeyUp={handleBlur}
      ></input>
      <input type="checkbox" checked={todo.done} onChange={handleCheck}></input>
      <button onClick={removeItem}>remove</button>
    </div>
  );
}
