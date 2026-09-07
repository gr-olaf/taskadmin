const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: envFile });

const path = require("path");
const express = require("express");
const tasksRouter = require("./routes/tasks");
const { initDb } = require("./db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

app.use("/api/tasks", tasksRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

const PORT = Number(process.env.PORT) || 8080;

if (require.main === module) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`API сервер запущен на порту ${PORT}`);
    });
  }).catch((err) => {
    console.error("Не удалось инициализировать базу данных:", err);
    process.exit(1);
  });
}

module.exports = app;