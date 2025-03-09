import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { LeaveType } from './collection';

// Search Leave Types Method
new ValidatedMethod({
  name: 'searchLeaveTypes',
  mixins: [],
  validate: new SimpleSchema({
    query: { type: String },
  }).validator(),
  async run({ query }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search leave types.');
    }

    try {
      const regex = new RegExp(query, 'i');
      return await LeaveType.find({ type_name: regex }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search leave types: ${error.message}`);
    }
  },
});
