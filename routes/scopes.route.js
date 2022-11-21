const express = require("express");
const router = express.Router();

// Importing scopes controller
const scopesCtrl = require("../controllers/scopes.controller");
const scopesMiddleware = require("../middleware/scopes.middleware")

router.post("/create", scopesMiddleware.isInputValidated, scopesCtrl.createScope)
router.get("/all", scopesCtrl.getAllScopes)
router.get("/:id", scopesCtrl.getScopeByID)
router.put("/:id", scopesCtrl.updateScope)
router.delete("/:id", scopesCtrl.deleteScope)

module.exports = router;