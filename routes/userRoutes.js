const express = require("express");
const router = express.Router;
const UserController = require("../controllers/UserController");
const checkAuth = require("../helpers/auth").checkAuth;

router.get("/showLogs", checkAuth, UserController.showLogs);

module.exports = router;