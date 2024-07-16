process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('./app'); 
const db = require('./db');



beforeEach(async () => {
    await db.query(`DELETE FROM books`);
    await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
      VALUES ('1234567890', 'http://a.co/eobPtX2', 'Test Author', 'English', 100, 'Test Publisher', 'Test Book', 2021)`);
  });
  
  afterAll(async () => {
    await db.end();
  });
  
  
describe('Bookstore Routes', () => {
    describe('GET /books', () => {
      it('should return a list of books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.body.books.length).toBe(1);
        expect(response.body.books[0]).toEqual({
          isbn: '1234567890',
          amazon_url: 'http://a.co/eobPtX2',
          author: 'Test Author',
          language: 'English',
          pages: 100,
          publisher: 'Test Publisher',
          title: 'Test Book',
          year: 2021,
        });
      });
    });
  
    describe('GET /books/:id', () => {
      it('should return a single book by id', async () => {
        const response = await request(app).get('/books/1234567890');
        expect(response.status).toBe(200);
        expect(response.body.book).toEqual({
          isbn: '1234567890',
          amazon_url: 'http://a.co/eobPtX2',
          author: 'Test Author',
          language: 'English',
          pages: 100,
          publisher: 'Test Publisher',
          title: 'Test Book',
          year: 2021,
        });
      });
  
      it('should return a 404 if the book is not found', async () => {
        const response = await request(app).get('/books/0000000000');
        expect(response.status).toBe(404);
      });
    });
  
    describe('POST /books', () => {
      it('should create a new book', async () => {
        const newBook = {
          isbn: '0987654321',
          amazon_url: 'http://a.co/newbook',
          author: 'New Author',
          language: 'Spanish',
          pages: 200,
          publisher: 'New Publisher',
          title: 'New Book',
          year: 2022,
        };
        const response = await request(app).post('/books').send(newBook);
        expect(response.status).toBe(201);
        expect(response.body.book).toMatchObject(newBook);
  
        const found = await request(app).get('/books/0987654321');
        expect(found.body.book).toEqual(newBook);
      });
  
      it('should return a 400 for invalid input', async () => {
        const invalidBook = { isbn: '0987654321', title: '' };
        const response = await request(app).post('/books').send(invalidBook);
        expect(response.status).toBe(400);
      });
    });
  
    describe('PUT /books/:isbn', () => {
      it('should update a book', async () => {
        const updatedBook = {
          amazon_url: 'http://a.co/updated',
          author: 'Updated Author',
          language: 'French',
          pages: 150,
          publisher: 'Updated Publisher',
          title: 'Updated Book',
          year: 2023,
        };
        const response = await request(app).put('/books/1234567890').send(updatedBook);
        expect(response.status).toBe(200);
        expect(response.body.book).toEqual({ isbn: '1234567890', ...updatedBook });
  
        const found = await request(app).get('/books/1234567890');
        expect(found.body.book).toEqual({ isbn: '1234567890', ...updatedBook });
      });
  
      it('should return a 400 for invalid input', async () => {
        const invalidBook = { amazon_url: '', author: '' };
        const response = await request(app).put('/books/1234567890').send(invalidBook);
        expect(response.status).toBe(400);
      });
  
      it('should return a 404 if the book is not found', async () => {
        const updatedBook = {
            amazon_url: 'http://a.co/updated',
            author: 'Updated Author',
            language: 'French',
            pages: 150,
            publisher: 'Updated Publisher',
            title: 'Updated Book',
            year: 2023,
          };
        const response = await request(app).put('/books/00000000').send(updatedBook);
        expect(response.status).toBe(404);
      });
    });
  
    describe('DELETE /books/:isbn', () => {
      it('should delete a book', async () => {
        const response = await request(app).delete('/books/1234567890');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Book deleted');
  
        const found = await request(app).get('/books/1234567890');
        expect(found.status).toBe(404);
      });
  
      it('should return a 404 if the book is not found', async () => {
        const response = await request(app).delete('/books/0000000000');
        expect(response.status).toBe(404);
      });
    });
  });