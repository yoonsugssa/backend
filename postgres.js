const { DataTypes } = require('sequelize');
const sequelize = require('./db'); 

const Cliente = sequelize.define('Cliente', {
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false
    }
}, {
    tableName: 'usuario', // <-- Nombre de la tabla
    timestamps: false
});

module.exports = Cliente;