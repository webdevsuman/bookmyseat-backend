import express from "express";
import cors from "cors";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres.fkoaogqbdsvubjrzosqk",
  host: "aws-0-ap-south-1.pooler.supabase.com",
  database: "postgres",
  password: "h359qKTgz-@gi-n",
  port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
let database;

const getUsers = async () => {
  try {
    const databaseQuery = await db.query(
      "SELECT id,username FROM users WHERE id != 1;"
    );
    database = databaseQuery.rows;
    return database;
  } catch (err) {
    console.log(err);
  }
};

const getRoom = async () => {
  try {
    const databaseQuery = await db.query("SELECT * FROM room_name");
    return databaseQuery.rows;
  } catch (err) {
    console.log(err);
  }
};

const allotedSeats = async () => {
  try {
    const databaseQuery = await db.query("SELECT * FROM seat_map");
    return databaseQuery.rows;
  } catch (err) {
    console.log(err);
  }
};

app.get("/login", async (req, res) => {
  database = await getUsers();
  const rooms = await getRoom();
  const bookings = await allotedSeats();
  res.json({ data: database, seeRooms: rooms, seeBookings: bookings });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const databaseQuery = await db.query(
      "SELECT * FROM users WHERE username=($1)",
      [username]
    );
    const database = databaseQuery.rows[0];
    // console.log(database);

    if (database.password === password) {
      if (username === "admin") {
        res.redirect("https://bookmyseat-suman.vercel.app/admin");
      } else {
        res.redirect(
          `https://bookmyseat-suman.vercel.app/users/${database.id}`
        );
      }
    } else {
      res.send("<p>Wrong Username or Password entered!</p>");
    }
  } catch (err) {
    console.log(err);
  }
});

// Add user
app.post("/adduser", async (req, res) => {
  // console.log(req.body);
  try {
    const username = req.body.username;
    const password = req.body.password;
    const databaseQuery = await db.query(
      "INSERT INTO users(username,password) VALUES($1,$2)",
      [username, password]
    );
    res.redirect("https://bookmyseat-suman.vercel.app/admin");
  } catch (err) {
    console.log(err);
  }
});

//Add room
app.post("/addroom", async (req, res) => {
  // console.log(req.body);
  try {
    const room_name = req.body.roomName;
    const total_seats = req.body.totalSeats;
    const databaseQuery = await db.query(
      "INSERT INTO room_name(room_name,total_seats) VALUES($1,$2)",
      [room_name, total_seats]
    );
    res.redirect("https://bookmyseat-suman.vercel.app/admin");
  } catch (err) {
    console.log(err);
  }
});

//Book Seat
app.post("/book", async (req, res) => {
  const { roomId, seatId, userId, userName, roomName } = req.body;
  // console.log(req.body);
  try {
    const databaseQuery = db.query(
      "INSERT INTO seat_map(room_id,seat_id,user_id,room_name, username) VALUES($1,$2,$3,$4,$5)",
      [roomId, seatId, userId, roomName, userName]
    );
    // res.redirect("")
  } catch (err) {
    console.log(err);
  }
});

//Delete Bookings
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const result = await db.query("DELETE FROM seat_map WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: "Slot not found" });
    }
    res.status(200).send({ message: "Slot deleted successfully" });
    res.redirect("https://bookmyseat-suman.vercel.app/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error deleting Slot" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
