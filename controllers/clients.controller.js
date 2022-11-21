const Clients = require("../models").clients;
const Products = require("../models").products;

/**
 * Function for creating a client
 * @param {*} req 
 * @param {*} res 
 */
exports.createClient = async (req, res) => {
    const {name, secret, url, product_id} = req.body;
    try {
        let result = await Clients.findOne({where: {name, secret}});

        if (result !== null) {
            res.status(200).json({
                error: 1,
                msg: "Client exists!"
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
                const response = await Clients.create({
                    name, secret, url, product_id
                });
                res.status(200).json({
                    error: 0,
                    msg: "Client created successfully!"
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
 * Function to get all clients
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllClients = async (req, res) => {
    try {
        let results = await Clients.findAll({
            include: Products
        });
        res.json({
            error: 0,
            results
        })
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}

/**
 * Function to get a client by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.getClientByID = async (req, res) => {
    const {id} = req.params
    try {
        let result = await Clients.findOne({where: {id},
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
 * Function to update a client by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.updateClient = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Clients.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Client does not exist!"
            });
        } else {
            const response = await Clients.update(req.body, {
                where: {id}
            })
            res.status(200).json({
                error: 0,
                msg: "Client updated successfully!"
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
 * Function to delete a client by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteClient = async (req, res) => {
    const {id} = req.params
    try {
        const result = await Clients.findOne({where: {id}})
        if (result === null) {
            res.status(400).json({
                error: 1,
                msg: "Client does not exist!"
            });
        } else {
            const response = await Clients.destroy({where: {id}})
            res.status(200).json({
                error: 1,
                msg: "Client deleted successfully!"
            });
        }
    } catch (error) {
        res.status(400).json({
            error: 1,
            msg: error
        })
    }
}