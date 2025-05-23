// UserFactory.js - Implements the Factory pattern for user creation

class User {
  constructor({ id, name, image }) {
    this.id = id;
    this.name = name;
    this.image = image;
  }
  // Default saveProfile throws error
  async saveProfile() {
    throw new Error('saveProfile() must be implemented by subclasses');
  }
}

class Client extends User {
  async saveProfile(database_pool) {
    await database_pool.query(
      'INSERT INTO clients(Id, Name, Image) VALUES (?, ?, ?)',
      [this.id, this.name, this.image]
    );
  }
}

class Freelancer extends User {
  constructor({ id, name, bio, image }) {
    super({ id, name, image });
    this.bio = bio;
  }
  async saveProfile(database_pool) {
    await database_pool.query(
      'INSERT INTO freelancers(Id, Name, bio, Image) VALUES (?, ?, ?, ?)',
      [this.id, this.name, this.bio, this.image]
    );
  }
}

export class UserFactory {
  static createUser(type, params) {
    switch (type.toLowerCase()) {
      case 'client':
        return new Client(params);
      case 'freelancer':
        return new Freelancer(params);
      default:
        throw new Error('Invalid User Type');
    }
  }
} 