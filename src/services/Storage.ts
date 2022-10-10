import Database from "tauri-plugin-sql-api";
import type { Video } from "../models/Video";

let db: Database;
const load = Database.load("sqlite:video.db").then((instance) => {
  db = instance;
  return db;
});

async function all(): Promise<Video[]> {
  await load; // FIXME: why only here?
  return await db.select("SELECT * FROM videos");
}

async function create(
  author_name: string,
  author_surname: string
): Promise<Video> {
  const { lastInsertId: id } = await db.execute(
    `INSERT INTO videos (author_name, author_surname) VALUES ($1, $2)`,
    [author_name, author_surname]
  );
  return {
    id,
    author_name,
    author_surname,
  };
}

// async function update(todo: Todo): Promise<Todo> {
//   await db.execute(
//     "UPDATE todos SET title = $1, completed = $2 WHERE id = $3",
//     [todo.title, todo.completed, todo.id]
//   );
//   return todo;
// }

// async function remove(id: number): Promise<boolean> {
//   return await db.execute("DELETE FROM todos WHERE id = $1", [id]);
// }

export default {
  all,
  create,
  //   update,
  //   remove,
};
