const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());
let db = null;
//ccbp submit NJSCPFVWOF
const intilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Error message :${e.message}`);
    process.exit(1);
  }
};
intilizeDbAndServer();
// API 1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const getUserQuery = `
  SELECT * FROM user WHERE username = '${username}'
  `;
  const userDetails = await db.get(getUserQuery);
  if (userDetails !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const addDetailsQuery = `
      INSERT INTO user (username , name , password , gender , location)
      VALUES ('${username}' , '${name}' ,'${hashedPassword}' , '${gender}' , '${location}')`;
      const a = await db.run(addDetailsQuery);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const userQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `;
  const user = await db.get(userQuery);
  if (user === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      response.status(200);
      response.send("Login success!");
    }
  }
});

//API 3
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const userQueryDetails = `
  SELECT * FROM user WHERE username = '${username}';
  `;
  const userDetails = await db.get(userQueryDetails);
  const passwordCheck = await bcrypt.compare(oldPassword, userDetails.password);

  if (passwordCheck === false) {
    response.status(400);
    response.send("Invalid current password");
  } else {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const update = `
          UPDATE user SET password = '${encryptedPassword}'
          WHERE username = '${username}'
          `;
      await db.run(update);
      response.status(200);
      response.send("Password updated");
    }
  }
});

module.exports = app;
