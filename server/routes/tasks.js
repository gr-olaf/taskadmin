const express = require("express");
const pool = require("../db");

const router = express.Router();

function validateTitle(title) {
  if (typeof title !== "string" || title.trim().length === 0) {
    return "Заголовок обязателен для заполнения";
  }
  if (title.length > 255) {
    return "Заголовок не должен превышать 255 символов";
  }
  return null;
}

function validateDescription(description) {
  if (typeof description !== "string") {
    return "Описание должно быть строкой";
  }
  if (description.length > 2000) {
    return "Описание не должно превышать 2000 символов";
  }
  return null;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, title, description, created_at FROM tasks ORDER BY position, created_at"
  );
  res.json(rows);
});

router.put("/reorder", async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "ids должен быть массивом идентификаторов задач" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ids.length; i += 1) {
      await client.query("UPDATE tasks SET position = $1 WHERE id = $2", [i, ids[i]]);
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, title, description, created_at FROM tasks WHERE id = $1",
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Задача не найдена" });
  }
  res.json(rows[0]);
});

router.post("/", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description || "";

  const titleError = validateTitle(title);
  const descError = validateDescription(description);
  if (titleError || descError) {
    return res.status(400).json({ errors: { title: titleError, description: descError } });
  }

  const { rows } = await pool.query(
    "INSERT INTO tasks (title, description, position) SELECT $1, $2, COALESCE(MAX(position), -1) + 1 FROM tasks RETURNING id, title, description, created_at",
    [title.trim(), description.trim()]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;

  const titleError = validateTitle(title);
  const descError = validateDescription(description || "");
  if (titleError || descError) {
    return res.status(400).json({ errors: { title: titleError, description: descError } });
  }

  const { rows } = await pool.query(
    "UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING id, title, description, created_at",
    [title.trim(), (description || "").trim(), req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Задача не найдена" });
  }
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { rows } = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING id",
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Задача не найдена" });
  }
  res.status(204).end();
});

module.exports = router;