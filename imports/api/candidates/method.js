import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Candidates } from './collection';
import { Position } from '../position/collection';
import { Interviews } from '../interview/collection';
// Insert Candidate Method
new ValidatedMethod({
  name: 'insertCandidate',
  mixins: [],
  validate: new SimpleSchema({
    position_id: { type: String }, // Reference to Position._id
    name: { type: String, max: 100 },
    phone: { type: String, optional: true },
    email: { type: String, regEx: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, // Fixed email validation
    status: { type: String },
  }).validator(),
  async run(candidateData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add candidates.');
    }

    const position = await Position.findOneAsync(candidateData.position_id);
    if (!position) {
      throw new Meteor.Error('Position not found', 'The selected position does not exist.');
    }

    try {
      return await Candidates.insertAsync({ ...candidateData, created_at: new Date() });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert candidate: ${error.message}`);
    }
  },
});

// Fetch Candidates Method
new ValidatedMethod({
  name: 'fetchCandidates',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch candidates.');
    }

    try {
      return await Candidates.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch candidates: ${error.message}`);
    }
  },
});

// Fetch Active Candidates Method
new ValidatedMethod({
  name: 'fetchActiveCandidates',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch active candidates.');
    }

    try {
      return await Candidates.rawCollection().aggregate([
        { $match: { status: 'active' } },
        {
          $lookup: {
            from: 'positions',
            localField: 'position_id',
            foreignField: '_id',
            as: 'positionDetails'
          }
        },
        { $unwind: '$positionDetails' },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            status: 1,
            positionName: '$positionDetails.title'
          }
        }
      ]).toArray();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch active candidates: ${error.message}`);
    }
  },
});

// Delete Candidate Method
new ValidatedMethod({
  name: 'deleteCandidate',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    const candidate = await Candidates.findOneAsync(_id);
    if (!candidate) {
      throw new Meteor.Error('not-found', 'Candidate not found');
    }

    // Check if the candidate is associated with any interviews
    const interviewCount = await Interviews.find({ candidate_id: _id }).countAsync();
    if (interviewCount > 0) {
      throw new Meteor.Error('associated-with-interview', 'Cannot delete candidate because they are associated with an interview');
    }

    // If no interviews are found, delete the candidate
    await Candidates.removeAsync(_id);
  },
});

// Update Candidate Method
new ValidatedMethod({
  name: 'updateCandidate',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    position_id: { type: String },
    name: { type: String, optional: true },
    phone: { type: String, optional: true },
    email: { type: String, regEx: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, optional: true },
    status: { type: String, optional: true },
  }).validator(),
  async run(candidateData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update candidates.');
    }

    const position = await Position.findOneAsync(candidateData.position_id);
    if (!position) {
      throw new Meteor.Error('Position not found', 'The selected position does not exist.');
    }

    try {
      const { _id, ...updateData } = candidateData;
      return await Candidates.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update candidate: ${error.message}`);
    }
  },
});
