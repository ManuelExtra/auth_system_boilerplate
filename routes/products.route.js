const express = require("express");
const router = express.Router();

// Importing products controller
const productsCtrl = require("../controllers/products.controller");
const productsMiddleware = require("../middleware/products.middleware");

router.post("/create", productsMiddleware.isInputValidated, productsCtrl.createProduct)
router.get("/all", productsCtrl.getAllProducts)
router.get("/:id", productsCtrl.getProductByID)
router.put("/:id", productsCtrl.updateProduct)
router.delete("/:id", productsCtrl.deleteProduct)

module.exports = router;