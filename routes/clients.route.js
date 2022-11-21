const express = require("express");
const router = express.Router();

// Importing clients controller
const clientsCtrl = require("../controllers/clients.controller");
const clientsMiddleware = require("../middleware/clients.middleware")

router.post("/create", clientsMiddleware.isInputValidated, clientsCtrl.createClient)
router.get("/all", clientsCtrl.getAllClients)
router.get("/:id", clientsCtrl.getClientByID)
router.put("/:id", clientsCtrl.updateClient)
router.delete("/:id", clientsCtrl.deleteClient)

module.exports = router;