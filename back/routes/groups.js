const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../utilities/db");
const authenticateToken = require("../utilities/authMiddleware");

// GET /api/users/groups
router.get("/", async (req, res) => {
  console.log("route : GET api/users/groups");
  try {
    // fetch the user with the email
    const [rows] = await db.execute(
      "SELECT users_groups_name, users_groups_type FROM users_groups"
    );
    const groups = rows;
    console.log("groupes trouvés : ", groups);
    // send the user information to the client
    res.status(200).json({ groups });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/users/groups
router.post("/", authenticateToken, async (req, res) => {
  console.log("route : POST api/users/groups");
  try {
    // check if the user is admin (users_permissions == 2)
    if (req.user.users_permissions != 2) {
      console.log(
        "permission : " +
          req.user.users_permissions +
          "with type : " +
          typeof req.user.users_permissions
      );
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid permissions" });
    }

    // check if the name is provided
    if (!req.body.name || req.body.name == "") {
      return res.status(400).json({ message: "Name is required" });
    }
    // check if the type is valid (is 'ASSO' or 'ADMIN')
    if (req.body.type != "ASSO" && req.body.type != "ADMIN") {
      return res.status(400).json({ message: "Invalid group type" });
    }

    // check if the name is already taken
    const [rows] = await db.execute(
      "SELECT * FROM users_groups WHERE users_groups_name = ?",
      [req.body.name]
    );
    if (rows.length > 0) {
      return res.status(409).json({ message: "Group name already taken" });
    }

    // fetch the user with the email
    const [rows1] = await db.execute(
      "INSERT INTO users_groups (users_groups_name, users_groups_type) VALUES (?,?)",
      [req.body.name, req.body.type]
    );
    const group = rows1;
    console.log("groupe ajouté : ", group);
    // send the user information to the client
    res.status(200).json({ group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/users/groups/:name
router.delete("/:name", authenticateToken, async (req, res) => {
  console.log("route : DELETE api/users/groups/:name");
  try {
    // check if the user is admin (users_permissions == 2)
    if (req.user.users_permissions != 2) {
      console.log(
        "permission : " +
          req.user.users_permissions +
          "with type : " +
          typeof req.user.users_permissions
      );
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid permissions" });
    }

    // check if the name is provided
    if (!req.params.name || req.params.name == "") {
      return res.status(400).json({ message: "Name is required" });
    }

    // check if the name exists
    const [rows] = await db.execute(
      "SELECT * FROM users_groups WHERE users_groups_name = ?",
      [req.params.name]
    );
    if (rows.length == 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // fetch the user with the email
    const [rows1] = await db.execute(
      "DELETE FROM users_groups WHERE users_groups_name = ?",
      [req.params.name]
    );
    const group = rows1;
    console.log("groupe supprimé : ", group);
    // send the user information to the client
    res.status(200).json({ group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
