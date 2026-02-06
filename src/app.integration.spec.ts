import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('AppModule (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create the application', () => {
    expect(app).toBeDefined();
  });

  it('should have all required modules loaded', () => {
    // This test verifies that all modules can be instantiated without errors
    expect(app).toBeTruthy();
  });
});
