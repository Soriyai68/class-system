import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Candidates } from '../candidates/collection';
import { Interviews } from './collection';

//insert
new ValidatedMethod({
  name: 'insertInterview',
  validate: new SimpleSchema({
    candidate_id: { type: String }, // Reference to Candidates._id
    interview_date: { type: Date },
    status: { type: String },
    notes: { type: String, optional: true },
    created_at: { type: Date, optional: true }, // Add this line
    result: { type: String, allowedValues: ['pass', 'fail', 'interviewing'] },
  }).validator(),
  async run(interviewData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add interviews.');
    }

    // Validate that the referenced candidate exists
    const candidate = await Candidates.findOneAsync({ _id: interviewData.candidate_id });
    if (!candidate) {
      throw new Meteor.Error('Invalid candidate', 'The provided candidate_id does not exist.');
    }

    // Ensure result is provided if status is "completed"
    if (interviewData.status === 'completed' && !interviewData.result) {
      throw new Meteor.Error('Validation Error', 'Result is required when the status is completed.');
    }

    try {
      const timestamp = new Date();
      interviewData.created_at = timestamp;
      const interviewId = await Interviews.insertAsync(interviewData);
      return interviewId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert interview: ${error.message}`);
    }
  },
});

//fetch
new ValidatedMethod({
  name: 'fetchInterviews',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch interviews.');
    }

    try {
      return Interviews.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch interviews: ${error.message}`);
    }
  },
});

//delete
new ValidatedMethod({
  name: 'deleteInterview',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete interviews.');
    }

    const interview = await Interviews.findOneAsync({ _id });
    if (!interview) {
      throw new Meteor.Error('Invalid interview', 'The provided interview_id does not exist.');
    }

    try {
      await Interviews.removeAsync({ _id });
      return { message: 'Interview deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete interview: ${error.message}`);
    }
  },
});

//update
new ValidatedMethod({
  name: 'updateInterview',
  validate: new SimpleSchema({
    _id: { type: String },
    candidate_id: { type: String, optional: true },
    interview_date: { type: Date, optional: true },
    status: { type: String, optional: true },
    notes: { type: String, optional: true },
    created_at: { type: Date, optional: true }, // Add this line
    result: { type: String, optional: true, allowedValues: ['pass', 'fail', 'interviewing'] },
  }).validator(),
  async run(interviewData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update interviews.');
    }

    // Validate that candidate exists if candidate_id is provided
    if (interviewData.candidate_id) {
      const candidate = await Candidates.findOneAsync({ _id: interviewData.candidate_id });
      if (!candidate) {
        throw new Meteor.Error('Invalid candidate', 'The provided candidate_id does not exist.');
      }
    }

    // Ensure result is provided if status is "completed"
    if (interviewData.status === 'completed' && !interviewData.result) {
      throw new Meteor.Error('Validation Error', 'Result is required when the status is completed.');
    }

    try {
      // Manually remove created_at from the updateData object if it exists
      const { _id, created_at, ...updateData } = interviewData; // This removes created_at from the update data

      // Perform the update operation, passing only allowed fields (without created_at)
      return await Interviews.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update interview: ${error.message}`);
    }
  },
});

//search
new ValidatedMethod({
  name: 'searchInterviews',
  validate: new SimpleSchema({
    searchTerm: { type: String },
  }).validator(),
  async run({ searchTerm }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search interviews.');
    }

    try {
      const regex = new RegExp(searchTerm, 'i');
      return Interviews.find({
        $or: [
          { candidate_id: regex },
          { interview_date: regex },
          { status: regex },
          { notes: regex },
        ]
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search interviews: ${error.message}`);
    }
  },
});

// Fetch candidates who passed the interview
new ValidatedMethod({
  name: 'fetchPassedCandidates',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch passed candidates.');
    }

    try {
      const passedInterviews = await Interviews.find({ result: 'pass' }).fetch();
      const candidateIds = passedInterviews.map(interview => interview.candidate_id);
      return Candidates.find({ _id: { $in: candidateIds } }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch passed candidates: ${error.message}`);
    }
  },
});

