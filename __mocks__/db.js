const sequelize = {
    authenticate: jest.fn().mockResolvedValue(), 
    sync: jest.fn().mockResolvedValue(),
};

module.exports = sequelize;