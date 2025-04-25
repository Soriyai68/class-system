import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Position } from './collection';
import { Division } from '../division/collection';

// Insert Position Method
new ValidatedMethod({
  name: 'insertPosition',
  mixins: [],
  validate: new SimpleSchema({
    title: { type: String, max: 100 },
    description: { type: String, optional: true },
    division_id: { type: String },
  }).validator(),
  async run(positionData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add positions.');
    }

    const division = await Division.findOneAsync({ _id: positionData.division_id });
    if (!division) {
      throw new Meteor.Error('Invalid division', 'The provided division_id does not exist.');
    }

    try {
      return await Position.insertAsync(positionData);
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert position: ${error.message}`);
    }
  },
});

// Fetch Positions Method
new ValidatedMethod({
  name: 'fetchPositions',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch positions.');
    }

    try {
      const positions = await Position.find().fetch();
      const divisions = await Division.find().fetch();
      return positions.map(position => {
        const division = divisions.find(div => div._id === position.division_id);
        return {
          ...position,
          division: division ? { name: division.name, department_id: division.department_id } : null
        };
      });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch positions: ${error.message}`);
    }
  },
});

// Delete Position Method
new ValidatedMethod({
  name: 'deletePosition',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete positions.');
    }

    try {
      await Position.removeAsync({ _id });
      return { message: 'Position deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete position: ${error.message}`);
    }
  },
});

// Update Position Method
new ValidatedMethod({
  name: 'updatePosition',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    title: { type: String, max: 100 }, // Remove optional
    description: { type: String, optional: true },
    division_id: { type: String },
  }).validator(),
  async run(positionData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update positions.');
    }

    if (positionData.division_id) {
      const division = await Division.findOneAsync({ _id: positionData.division_id });
      if (!division) {
        throw new Meteor.Error('Invalid division', 'The provided division_id does not exist.');
      }
    }

    try {
      const { _id, ...updateData } = positionData;
      await Position.updateAsync({ _id }, { $set: updateData });
      return { message: 'Position updated successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update position: ${error.message}`);
    }
  },
});