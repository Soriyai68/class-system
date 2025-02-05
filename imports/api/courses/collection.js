import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Courses = new Mongo.Collection('courses');

const CoursesSchema = new SimpleSchema({
    course_name: {
        type: String,
        label: "Course Name",
    },
    description: {
        type: String,
        label: "Course Description",
    },
    teacher_id: {
        type: String,
        label: "Teacher ID",
    }
});

Courses.attachSchema?.(CoursesSchema);

