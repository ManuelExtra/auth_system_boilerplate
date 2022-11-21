const express = require("express");
const router = express.Router();

// Importing roles controller
const rolesCtrl = require("../controllers/roles.controller");
const rolesMiddleware = require("../middleware/roles.middleware")

router.post("/create", rolesMiddleware.isInputValidated, rolesCtrl.createRole)
router.get("/all", rolesCtrl.getAllRoles)
router.get("/:id", rolesCtrl.getRoleByID)
router.put("/:id", rolesCtrl.updateRole)
router.delete("/:id", rolesCtrl.deleteRole)

module.exports = router;