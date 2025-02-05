import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Courses } from './collection';
import { Teachers } from '../teachers/collection';


new ValidatedMethod({
    name: 'insertCourse',
    mixins: [],
    validate: new SimpleSchema({
        course_name: { type: String, max: 100 },
        description: { type: String, optional: true },
        teacher_id: { type: String },
    }).validator(),
    async run(courseData) {
        console.log('Received course data:', courseData);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to add courses.');
        }

        try {
            // Log Teachers collection to make sure it's accessible
            console.log('Teachers collection:', Teachers);

            // Ensure teacher exists
            const teacher = await Teachers.findOneAsync(courseData.teacher_id);
            if (!teacher) {
                throw new Meteor.Error('Invalid teacher', 'The specified teacher does not exist.');
            }

            console.log('Teacher found:', teacher);

            // Insert the course data into the Courses collection
            const courseId = await Courses.insertAsync(courseData);
            console.log('Inserted course ID:', courseId);

            return courseId;
        } catch (error) {
            console.error('Error during insert:', error);
            throw new Meteor.Error('Database Error', `Failed to insert course: ${error.message}`);
        }
    },
});

// Fetch Courses Method
new ValidatedMethod({
    name: 'fetchCourses',
    mixins: [],
    validate: null, // No validation needed for fetching courses
    async run() {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to fetch courses.');
        }

        try {
            console.log('Fetching all courses');  // Log when fetch operation starts
            const coursesList = await Courses.find().fetch();
            console.log('Fetched courses:', coursesList);  // Log the fetched courses list
            return coursesList; // Return the list of courses
        } catch (error) {
            console.error('Failed to fetch courses:', error);  // Log any fetch errors
            throw new Meteor.Error('Database Error', `Failed to fetch courses: ${error.message}`);
        }
    },
});

// Delete Course Method
new ValidatedMethod({
    name: 'deleteCourse',
    mixins: [],
    validate: new SimpleSchema({
        _id: { type: String },
    }).validator(),
    async run({ _id }) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to delete courses.');
        }

        try {
            const course = await Courses.findOneAsync({ _id });
            if (!course) {
                throw new Meteor.Error('Course not found', 'The course you are trying to delete does not exist.');
            }

            await Courses.removeAsync({ _id });
            console.log(`Deleted course with ID: ${_id}`);
            return { message: 'Course deleted successfully!' };
        } catch (error) {
            console.error('Failed to delete course:', error);  // Log the actual error
            throw new Meteor.Error('Database Error', `Failed to delete course: ${error.message}`);
        }
    },
});

// Update Course Method
new ValidatedMethod({
    name: 'updateCourse',
    mixins: [],
    validate: new SimpleSchema({
        _id: { type: String },
        course_name: { type: String, optional: true },
        description: { type: String, optional: true },
        teacher_id: { type: String, optional: true },
    }).validator(),
    async run(courseData) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to update courses.');
        }

        try {
            const { _id, ...updateData } = courseData;

            // Ensure the course exists before updating
            const course = await Courses.findOneAsync({ _id });
            if (!course) {
                throw new Meteor.Error('Course not found', 'The course you are trying to update does not exist.');
            }

            // Update the course in the collection
            const result = await Courses.updateAsync({ _id }, { $set: updateData });
            console.log(`Updated course with ID: ${_id}`);
            return result;
        } catch (error) {
            console.error('Failed to update course:', error);  // Log the actual error
            throw new Meteor.Error('Database Error', `Failed to update course: ${error.message}`);
        }
    },
});
