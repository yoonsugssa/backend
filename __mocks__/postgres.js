const Cliente = {
    create: jest.fn(async (data) => ({
        id: Date.now(), // ID simulado
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })),
    
    findAll: jest.fn(async () => [
        { id: 1, nombre: 'Cliente Mock 1' },
        { id: 2, nombre: 'Cliente Mock 2' }
    ])
};

module.exports = Cliente;