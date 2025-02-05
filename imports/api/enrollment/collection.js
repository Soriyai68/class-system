// import { en } from 'element-plus/es/locales.mjs';
import { en } from 'element-plus/es/locales.mjs';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Enrollment = new Mongo.Collection('enrollment');

const EnrollmentSchema = new SimpleSchema({
   
    student_id: {
        type: String,
        label: "Student ID",
    },
    course_id: {
        type: String,
        label: "Course ID",
    },
    enrollment_date: {
        type: Date,
        label: "Enrollment Date",
    },
    enrollment_cost: {
        type: Number,
        label: "Enrollment Cost",
    },
});

Enrollment.attachSchema?.(EnrollmentSchema);

