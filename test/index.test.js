const request = require('supertest');
const setupApp = require('../index'); 
const Cliente = require('../postgres'); 


jest.mock('../db'); 
jest.mock('../postgres');

let app; 

beforeAll(async () => {
    
    app = await setupApp(); 
});

afterAll(() => {
    jest.clearAllMocks();
});


describe('Pruebas de Integración de Endpoints de Clientes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /clientes', () => {
        
        test('Debe responder con 201 y crear un cliente si el nombre es válido', async () => {
            const nuevoClienteData = { nombre: 'Cliente Test POST' };
            const clienteCreadoMock = { id: 101, ...nuevoClienteData };
            
            Cliente.create.mockResolvedValue(clienteCreadoMock);

            const response = await request(app)
                .post('/clientes')
                .send(nuevoClienteData)
                .expect('Content-Type', /json/)
                .expect(201); 

            expect(Cliente.create).toHaveBeenCalledWith(nuevoClienteData);
            expect(response.body).toEqual(clienteCreadoMock);
        });

        test('Debe responder con 400 si falta el campo "nombre"', async () => {
            const response = await request(app)
                .post('/clientes')
                .send({}) 
                .expect('Content-Type', /json/)
                .expect(400); 

            expect(Cliente.create).not.toHaveBeenCalled();
            expect(response.body.error).toBe('El campo "nombre" es obligatorio.');
        });

        test('Debe responder con 500 si la base de datos falla al crear', async () => {
            
            Cliente.create.mockRejectedValue(new Error('DB Error'));

            const response = await request(app)
                .post('/clientes')
                .send({ nombre: 'Falla Interna' })
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body.error).toBe('Error al insertar el registro en la base de datos');
        });
    });

    describe('GET /clientes', () => {
        
        test('Debe responder con 200 y la lista de clientes', async () => {
            const clientesMock = [
                { id: 10, nombre: 'Cliente A' },
                { id: 20, nombre: 'Cliente B' }
            ];
            
           
            Cliente.findAll.mockResolvedValue(clientesMock);

            const response = await request(app)
                .get('/clientes')
                .expect('Content-Type', /json/)
                .expect(200); 

            expect(Cliente.findAll).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(clientesMock);
        });
        
        test('Debe responder con 500 si la base de datos falla al obtener clientes', async () => {
            
            Cliente.findAll.mockRejectedValue(new Error('DB Retrieval Error'));

            const response = await request(app)
                .get('/clientes')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body.error).toBe('Error interno del servidor al obtener clientes');
        });
    });
});