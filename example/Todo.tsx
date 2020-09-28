import * as React from 'react';
import { db } from '@usedb/core';
import { useDB } from '../.';

const FETCH_ALL = db.todos.findMany({ where: {} });
export default function Todo() {
  const allTodos = useDB(FETCH_ALL);
  const addTodo = useDB();
  if (allTodos.loading) {
    return <div>Loading..</div>;
  }
  let count = (allTodos.data?.length || 0) + 1;
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
        onClick={() =>
          addTodo.setQuery(
            db.todos.create({
              data: { id: count, caption: '', done: false },
            }),
            { refetchQueries: [FETCH_ALL] }
          )
        }
      >
        Add task
      </button>
      {allTodos.data
        ? allTodos.data.map(todo => <TodoItem key={todo.id} todo={todo} />)
        : null}
    </div>
  );
}

function TodoItem({ todo }) {
  const [value, setValue] = React.useState(todo.caption);
  const updateQuery = useDB();

  const handleChange = (e: any) => {
    e.persist();
    setValue(e.target.value);
  };
  const handleBlur = () => {
    updateQuery.setQuery(
      db.todos.update({
        where: { id: todo.id },
        data: { ...todo, caption: value },
      })
    );
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
  };
  return (
    <div style={{ margin: 10 }}>
      <input
        style={{ textDecoration: `${todo.done ? 'line-through' : 'none'}` }}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      ></input>
      <input type="checkbox" checked={todo.done} onChange={handleCheck}></input>
      <button onClick={removeItem}>remove</button>
    </div>
  );
}
