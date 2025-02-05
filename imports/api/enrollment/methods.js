import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Enrollment } from './collection';
import { Courses } from '../courses/collection';
import { Students } from '../students/collection';

// Insert Enrollment Method
// new ValidatedMethod({
//     name: 'insertEnrollment',
//     mixins: [],
//     validate: new SimpleSchema({
//         student_id: { type: String },
//         course_id: { type: String },
//         enrollment_date: { type: Date },
//         enrollment_cost: { type: Number }, // Added enrollment_cost
//     }).validator(),
//     async run(enrollmentData) {
//         console.log('Received enrollment data:', enrollmentData);

//         if (!this.userId) {
//             throw new Meteor.Error('Not authorized', 'You must be logged in to enroll in courses.');
//         }

//         try {
//             // Log Courses and Students collections to make sure they're accessible
//             console.log('Courses collection:', Courses);
//             console.log('Students collection:', Students);

//             // Ensure course exists
//             const course = await Courses.findOneAsync(enrollmentData.course_id);
//             if (!course) {
//                 throw new Meteor.Error('Invalid course', 'The specified course does not exist.');
//             }

//             console.log('Course found:', course);

//             // Ensure student exists
//             const student = await Students.findOneAsync(enrollmentData.student_id);
//             if (!student) {
//                 throw new Meteor.Error('Invalid student', 'The specified student does not exist.');
//             }

//             console.log('Student found:', student);

//             // Insert the enrollment data into the Enrollment collection
//             const enrollmentId = await Enrollment.insertAsync(enrollmentData);
//             console.log('Inserted enrollment ID:', enrollmentId);

//             return enrollmentId;
//         } catch (error) {
//             console.error('Error during insert:', error);
//             throw new Meteor.Error('Database Error', `Failed to insert enrollment: ${error.message}`);
//         }
//     },
// });

//insertEnrollment Method
new ValidatedMethod({
    name: 'insertEnrollment',
    mixins: [],
    validate: new SimpleSchema({
        student_id: { type: String },
        course_id: { type: String },
        enrollment_date: { type: Date },
        enrollment_cost: { type: Number },
    }).validator(),
    async run(enrollmentData) {
        console.log('Received enrollment data:', enrollmentData);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to enroll in courses.');
        }

        try {
            // Ensure course exists
            const course = await Courses.findOneAsync(enrollmentData.course_id);
            if (!course) {
                throw new Meteor.Error('Invalid course', 'The specified course does not exist.');
            }

            console.log('Course found:', course);

            // Ensure student exists
            const student = await Students.findOneAsync(enrollmentData.student_id);
            if (!student) {
                throw new Meteor.Error('Invalid student', 'The specified student does not exist.');
            }

            console.log('Student found:', student);

            // Check current enrollment count for the course
            const enrollmentCount = await Enrollment.find({ course_id: enrollmentData.course_id }).countAsync();
            if (enrollmentCount >= 25) {
                throw new Meteor.Error('Course full', 'This course has reached its maximum capacity of 25 students.');
            }

            // Insert the enrollment data into the Enrollment collection
            const enrollmentId = await Enrollment.insertAsync(enrollmentData);
            console.log('Inserted enrollment ID:', enrollmentId);

            return enrollmentId;
        } catch (error) {
            console.error('Error during insert:', error);
            throw new Meteor.Error('Database Error', `Failed to insert enrollment: ${error.message}`);
        }
    },
});

// Fetch Enrollments Method
new ValidatedMethod({
    name: 'fetchEnrollments',
    mixins: [],
    validate: null, // No validation needed for fetching enrollments
    async run() {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to fetch enrollments.');
        }

        try {
            console.log('Fetching all enrollments');  // Log when fetch operation starts
            const enrollmentsList = await Enrollment.find().fetch();
            console.log('Fetched enrollments:', enrollmentsList);  // Log the fetched enrollments list
            return enrollmentsList; // Return the list of enrollments
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);  // Log any fetch errors
            throw new Meteor.Error('Database Error', `Failed to fetch enrollments: ${error.message}`);
        }
    },
});

// Delete Enrollment Method
new ValidatedMethod({
    name: 'deleteEnrollment',
    mixins: [],
    validate: new SimpleSchema({
        _id: { type: String },
    }).validator(),
    async run({ _id }) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to delete enrollments.');
        }

        try {
            await Enrollment.removeAsync({ _id });
            return { message: 'Enrollment deleted successfully!' };
        } catch (error) {
            throw new Meteor.Error('Database Error', `Failed to delete enrollment: ${error.message}`);
        }
    },
});

// Update Enrollment Method
new ValidatedMethod({
    name: 'updateEnrollment',
    mixins: [],
    validate: new SimpleSchema({
        _id: { type: String },
        student_id: { type: String },
        course_id: { type: String },
        enrollment_date: { type: Date },
        enrollment_cost: { type: Number }, // Added enrollment_cost
    }).validator(),
    async run({ _id, student_id, course_id, enrollment_date, enrollment_cost }) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized', 'You must be logged in to update enrollments.');
        }

        try {
            await Enrollment.updateAsync({ _id }, {
                $set: {
                    student_id,
                    course_id,
                    enrollment_date,
                    enrollment_cost, // Added enrollment_cost
                },
            });

            return { message: 'Enrollment updated successfully!' };
        } catch (error) {
            throw new Meteor.Error('Database Error', `Failed to update enrollment: ${error.message}`);
        }
    },
});
