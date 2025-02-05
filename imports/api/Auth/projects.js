import { Mongo } from 'meteor/mongo';
export const UserClass = new Mongo.Collection('userClass');

// Security rules (server-side only)
if (Meteor.isServer) {
  UserClass.allow({
    insert: () => false, // Disallow direct inserts
    update: () => false, // Disallow direct updates
    remove: () => false // Disallow direct removes
  });
}

 Meteor.methods({
  'userClass.insert'(userData) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    return UserClass.insert({
      ...userData,
      owner: this.userId,
      createdAt: new Date(),
      role: 'user', // Default role
      status: 'active'
    });
  },

  'userClass.update'(userId, updates) {
    if (!this.userId || this.userId !== userId) {
      throw new Meteor.Error('Not authorized');
    }
    
    return UserClass.update(userId, {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    });
  },

  'userClass.remove'(userId) {
    if (!this.userId || this.userId !== userId) {
      throw new Meteor.Error('Not authorized');
    }
    return UserClass.remove(userId);
  }
});