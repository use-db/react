import * as React from 'react';
import { db } from '@usedb/core';
import { useDB } from '../.';

export default function Todo() {
  const { data, loading, error, setQuery } = useDB();

  if (loading) {
    return <div>Loading..</div>;
  }
  let count = (data?.length || 0) + 1;
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
          setQuery(
            db.todos.create({
              data: { id: count, caption: '', done: false },
            }),
            { refetchQueries: db.todos.findMany({ where: {} }) }
          )
        }
      >
        Add task
      </button>
      {data
        ? data.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              updateParent={() => {
                setQuery(db.todos.findMany({ where: {} }));
              }}
            />
          ))
        : null}
    </div>
  );
}

function TodoItem({ todo, updateParent }) {
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
      })
    );
    updateParent();
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
