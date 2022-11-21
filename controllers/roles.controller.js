const Roles = require("../models").roles;
const Products = require("../models").products;

/**
 * Function for creating a Role
 * @param {*} req 
 * @param {*} res 
 */
exports.createRole = async (req, res) => {
    const {name, description, product_id} = req.body;
    try {
        let result = await Roles.findOne({where: {name}});

        if (result !== null) {
            res.status(200).json({
                error: 1,
                msg: "Role exists!"
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
                const response = await Roles.create({
                    name, description, product_id
                });
                res.status(200).json({
                    error: 0,
                    msg: "Role created successfully!"
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
 * Function to get all Roles
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllRoles = async (req, res) => {
    try {
        const result = await Roles.findAll({
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
 * Function to get a Role by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.getRoleByID = async (req, res) => {
    const {id} = req.params
    try {
        let result = await Roles.findOne({where: {id},
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
 * Function to update a Role by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.updateRole = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Roles.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Role does not exist!"
            });
        } else {
            const response = await Roles.update(req.body, {
                where: {id}
            })
            res.status(200).json({
                error: 0,
                msg: "Role updated successfully!"
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
 * Function to delete a Role by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteRole = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Roles.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Role does not exist!"
            });
        } else {
            const response = await Roles.destroy({where: {id}})
            res.status(200).json({
                error: 1,
                msg: "Role deleted successfully!"
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}