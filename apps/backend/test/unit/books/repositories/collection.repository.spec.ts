import { MikroORM } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../../../src/auth/entities/user.entity";
import { Collection } from "../../../../src/books/entities/collection.entity";
import { CollectionRepository } from "../../../../src/books/repositories/collection.repository";
import { BooksTestModule } from "../books-test.module";

describe('CollectionRepository', () => {
  let repository: CollectionRepository;
  let orm: MikroORM;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BooksTestModule],
    }).compile();

    repository = module.get<CollectionRepository>(CollectionRepository);
    orm = module.get<MikroORM>(MikroORM);

    await orm.getSchemaGenerator().createSchema();
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase();
    
    // Create a test user for each test
    testUser = new User();
    testUser.email = 'test@example.com';
    testUser.passwordHash = 'hashed_password';
    testUser.displayName = 'Test User';
    
    await orm.em.persistAndFlush(testUser);
    orm.em.clear();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByOwnerId', () => {
    it('should find collections by owner ID', async () => {
      // Given
      const collection1 = new Collection();
      collection1.name = 'Collection 1';
      collection1.owner = testUser;

      const collection2 = new Collection();
      collection2.name = 'Collection 2';
      collection2.owner = testUser;

      await orm.em.persistAndFlush([collection1, collection2]);
      orm.em.clear();

      // When
      const result = await repository.findByOwnerId(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Collection 1');
      expect(result[1].name).toBe('Collection 2');
    });

    it('should return empty array if user has no collections', async () => {
      // When
      const result = await repository.findByOwnerId(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('findByIdAndOwnerId', () => {
    it('should find a collection by ID and owner ID', async () => {
      // Given
      const collection = new Collection();
      collection.name = 'Test Collection';
      collection.owner = testUser;

      await orm.em.persistAndFlush(collection);
      orm.em.clear();

      // When
      const result = await repository.findByIdAndOwnerId(collection.id, testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Collection');
      expect(result?.owner.id).toBe(testUser.id);
    });

    it('should return null if collection not found', async () => {
      // When
      const result = await repository.findByIdAndOwnerId('non-existent-id', testUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('findDefaultCollection', () => {
    it('should find the default collection for a user', async () => {
      // Given
      const defaultCollection = new Collection();
      defaultCollection.name = 'Default Collection';
      defaultCollection.isDefault = true;
      defaultCollection.owner = testUser;

      const regularCollection = new Collection();
      regularCollection.name = 'Regular Collection';
      regularCollection.isDefault = false;
      regularCollection.owner = testUser;

      await orm.em.persistAndFlush([defaultCollection, regularCollection]);
      orm.em.clear();

      // When
      const result = await repository.findDefaultCollection(testUser.id);

      // Then
      expect(result).toBeDefined();
      expect(result?.name).toBe('Default Collection');
      expect(result?.isDefault).toBe(true);
    });

    it('should return null if no default collection exists', async () => {
      // Given
      const regularCollection = new Collection();
      regularCollection.name = 'Regular Collection';
      regularCollection.isDefault = false;
      regularCollection.owner = testUser;

      await orm.em.persistAndFlush(regularCollection);
      orm.em.clear();

      // When
      const result = await repository.findDefaultCollection(testUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('updateCollection', () => {
    it('should update a collection', async () => {
      // Given
      const collection = new Collection();
      collection.name = 'Old Name';
      collection.description = 'Old Description';
      collection.owner = testUser;

      await orm.em.persistAndFlush(collection);
      orm.em.clear();

      // When
      const updateData = { name: 'New Name', description: 'New Description' };
      const updateResult = await repository.updateCollection(collection.id, updateData);
      const updatedCollection = await repository.findOne(collection.id);

      // Then
      expect(updateResult).toBe(1); // 1 row affected
      expect(updatedCollection).toBeDefined();
      expect(updatedCollection?.name).toBe('New Name');
      expect(updatedCollection?.description).toBe('New Description');
    });

    it('should return 0 if no collection found to update', async () => {
      // When
      const updateData = { name: 'New Name' };
      const result = await repository.updateCollection('non-existent-id', updateData);

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      // Given
      const collection = new Collection();
      collection.name = 'Collection to Delete';
      collection.owner = testUser;

      await orm.em.persistAndFlush(collection);
      orm.em.clear();

      // When
      const deleteResult = await repository.deleteCollection(collection.id);
      const checkCollection = await repository.findOne(collection.id);

      // Then
      expect(deleteResult).toBe(1); // 1 row affected
      expect(checkCollection).toBeNull();
    });

    it('should return 0 if no collection found to delete', async () => {
      // When
      const result = await repository.deleteCollection('non-existent-id');

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });

  describe('deleteAllCollectionsByOwnerId', () => {
    it('should delete all collections belonging to a user', async () => {
      // Given
      const collection1 = new Collection();
      collection1.name = 'Collection 1';
      collection1.owner = testUser;

      const collection2 = new Collection();
      collection2.name = 'Collection 2';
      collection2.owner = testUser;

      await orm.em.persistAndFlush([collection1, collection2]);
      orm.em.clear();

      // When
      const deleteResult = await repository.deleteAllCollectionsByOwnerId(testUser.id);
      const remainingCollections = await repository.findByOwnerId(testUser.id);

      // Then
      expect(deleteResult).toBe(2); // 2 rows affected
      expect(remainingCollections.length).toBe(0);
    });

    it('should return 0 if user has no collections', async () => {
      // When
      const result = await repository.deleteAllCollectionsByOwnerId(testUser.id);

      // Then
      expect(result).toBe(0); // 0 rows affected
    });
  });
}); 