const Scopes = require("../models").scopes;
const Products = require("../models").products;

/**
 * Function for creating a Scope
 * @param {*} req 
 * @param {*} res 
 */
exports.createScope = async (req, res) => {
    const {name, description, product_id} = req.body;
    try {
        let result = await Scopes.findOne({where: {name}});

        if (result !== null) {
            res.status(200).json({
                error: 1,
                msg: "Scope exists!"
            })
        } else {
            result = await Products.findOne({where: {id: product_id}});
            if(result === null){
                res.status(200).json({
                    error: 1,
                    msg: "Product does not exist!"
                })
            }
            else{
                const response = await Scopes.create({
                    name, description, product_id
                });
                res.status(200).json({
                    error: 0,
                    msg: "Scope created successfully!"
                })
            }
        }
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        });
    }
    
    
}

/**
 * Function to get all Scopes
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllScopes = async (req, res) => {
    try {
        const result = await Scopes.findAll({
            include: Products
        });
        res.json({
            error: 0,
            result
        })
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}

/**
 * Function to get a Scope by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.getScopeByID = async (req, res) => {
    const {id} = req.params
    try {
        let result = await Scopes.findOne({where: {id},
            include: Products
        })
        result = result === null ? {} : result
        res.json({
            error: 0,
            result
        })
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}

/**
 * Function to update a Scope by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.updateScope = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Scopes.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Scope does not exist!"
            });
        } else {
            const response = await Scopes.update(req.body, {
                where: {id}
            })
            res.status(200).json({
                error: 0,
                msg: "Scope updated successfully!"
            })
        }
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}

/**
 * Function to delete a Scope by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteScope = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Scopes.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Scope does not exist!"
            });
        } else {
            const response = await Scopes.destroy({where: {id}})
            res.status(200).json({
                error: 1,
                msg: "Scope deleted successfully!"
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}