Package["core-runtime"].queue("null",function () {/* Imports for global scope */

MongoInternals = Package.mongo.MongoInternals;
Mongo = Package.mongo.Mongo;
ReactiveVar = Package['reactive-var'].ReactiveVar;
ECMAScript = Package.ecmascript.ECMAScript;
ValidatedMethod = Package['mdg:validated-method'].ValidatedMethod;
FilesCollection = Package['ostrio:files'].FilesCollection;
Accounts = Package['accounts-base'].Accounts;
Collection2 = Package['aldeed:collection2'].Collection2;
Meteor = Package.meteor.Meteor;
global = Package.meteor.global;
meteorEnv = Package.meteor.meteorEnv;
EmitterPromise = Package.meteor.EmitterPromise;
WebApp = Package.webapp.WebApp;
WebAppInternals = Package.webapp.WebAppInternals;
main = Package.webapp.main;
DDP = Package['ddp-client'].DDP;
DDPServer = Package['ddp-server'].DDPServer;
LaunchScreen = Package['launch-screen'].LaunchScreen;
meteorInstall = Package.modules.meteorInstall;
Promise = Package.promise.Promise;
Autoupdate = Package.autoupdate.Autoupdate;

var require = meteorInstall({"imports":{"api":{"Auth":{"projects.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/Auth/projects.js                                                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    module.export({
      UserClass: () => UserClass
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const UserClass = new Mongo.Collection('userClass');
    // Security rules (server-side only)
    if (Meteor.isServer) {
      UserClass.allow({
        insert: () => false,
        // Disallow direct inserts
        update: () => false,
        // Disallow direct updates
        remove: () => false // Disallow direct removes
      });
    }
    Meteor.methods({
      'userClass.insert'(userData) {
        if (!this.userId) throw new Meteor.Error('Not authorized');
        return UserClass.insert(_objectSpread(_objectSpread({}, userData), {}, {
          owner: this.userId,
          createdAt: new Date(),
          role: 'user',
          // Default role
          status: 'active'
        }));
      },
      'userClass.update'(userId, updates) {
        if (!this.userId || this.userId !== userId) {
          throw new Meteor.Error('Not authorized');
        }
        return UserClass.update(userId, {
          $set: _objectSpread(_objectSpread({}, updates), {}, {
            updatedAt: new Date()
          })
        });
      },
      'userClass.remove'(userId) {
        if (!this.userId || this.userId !== userId) {
          throw new Meteor.Error('Not authorized');
        }
        return UserClass.remove(userId);
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"courses":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/courses/collection.js                                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _Courses$attachSchema;
    module.export({
      Courses: () => Courses
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Courses = new Mongo.Collection('courses');
    const CoursesSchema = new SimpleSchema({
      course_name: {
        type: String,
        label: "Course Name"
      },
      description: {
        type: String,
        label: "Course Description"
      },
      teacher_id: {
        type: String,
        label: "Teacher ID"
      }
    });
    (_Courses$attachSchema = Courses.attachSchema) === null || _Courses$attachSchema === void 0 ? void 0 : _Courses$attachSchema.call(Courses, CoursesSchema);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/courses/index.js                                                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./methods");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/courses/methods.js                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 0);
    const _excluded = ["_id"];
    let ValidatedMethod;
    module.link("meteor/mdg:validated-method", {
      ValidatedMethod(v) {
        ValidatedMethod = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    let Courses;
    module.link("./collection", {
      Courses(v) {
        Courses = v;
      }
    }, 2);
    let Teachers;
    module.link("../teachers/collection", {
      Teachers(v) {
        Teachers = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    new ValidatedMethod({
      name: 'insertCourse',
      mixins: [],
      validate: new SimpleSchema({
        course_name: {
          type: String,
          max: 100
        },
        description: {
          type: String,
          optional: true
        },
        teacher_id: {
          type: String
        }
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
          throw new Meteor.Error('Database Error', "Failed to insert course: ".concat(error.message));
        }
      }
    });

    // Fetch Courses Method
    new ValidatedMethod({
      name: 'fetchCourses',
      mixins: [],
      validate: null,
      // No validation needed for fetching courses
      async run() {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to fetch courses.');
        }
        try {
          console.log('Fetching all courses'); // Log when fetch operation starts
          const coursesList = await Courses.find().fetch();
          console.log('Fetched courses:', coursesList); // Log the fetched courses list
          return coursesList; // Return the list of courses
        } catch (error) {
          console.error('Failed to fetch courses:', error); // Log any fetch errors
          throw new Meteor.Error('Database Error', "Failed to fetch courses: ".concat(error.message));
        }
      }
    });

    // Delete Course Method
    new ValidatedMethod({
      name: 'deleteCourse',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        }
      }).validator(),
      async run(_ref) {
        let {
          _id
        } = _ref;
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to delete courses.');
        }
        try {
          const course = await Courses.findOneAsync({
            _id
          });
          if (!course) {
            throw new Meteor.Error('Course not found', 'The course you are trying to delete does not exist.');
          }
          await Courses.removeAsync({
            _id
          });
          console.log("Deleted course with ID: ".concat(_id));
          return {
            message: 'Course deleted successfully!'
          };
        } catch (error) {
          console.error('Failed to delete course:', error); // Log the actual error
          throw new Meteor.Error('Database Error', "Failed to delete course: ".concat(error.message));
        }
      }
    });

    // Update Course Method
    new ValidatedMethod({
      name: 'updateCourse',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        },
        course_name: {
          type: String,
          optional: true
        },
        description: {
          type: String,
          optional: true
        },
        teacher_id: {
          type: String,
          optional: true
        }
      }).validator(),
      async run(courseData) {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to update courses.');
        }
        try {
          const {
              _id
            } = courseData,
            updateData = _objectWithoutProperties(courseData, _excluded);

          // Ensure the course exists before updating
          const course = await Courses.findOneAsync({
            _id
          });
          if (!course) {
            throw new Meteor.Error('Course not found', 'The course you are trying to update does not exist.');
          }

          // Update the course in the collection
          const result = await Courses.updateAsync({
            _id
          }, {
            $set: updateData
          });
          console.log("Updated course with ID: ".concat(_id));
          return result;
        } catch (error) {
          console.error('Failed to update course:', error); // Log the actual error
          throw new Meteor.Error('Database Error', "Failed to update course: ".concat(error.message));
        }
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"enrollment":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/enrollment/collection.js                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _Enrollment$attachSch;
    module.export({
      Enrollment: () => Enrollment
    });
    let en;
    module.link("element-plus/es/locales.mjs", {
      en(v) {
        en = v;
      }
    }, 0);
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 1);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Enrollment = new Mongo.Collection('enrollment');
    const EnrollmentSchema = new SimpleSchema({
      student_id: {
        type: String,
        label: "Student ID"
      },
      course_id: {
        type: String,
        label: "Course ID"
      },
      enrollment_date: {
        type: Date,
        label: "Enrollment Date"
      },
      enrollment_cost: {
        type: Number,
        label: "Enrollment Cost"
      }
    });
    (_Enrollment$attachSch = Enrollment.attachSchema) === null || _Enrollment$attachSch === void 0 ? void 0 : _Enrollment$attachSch.call(Enrollment, EnrollmentSchema);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/enrollment/index.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./methods");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/enrollment/methods.js                                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let ValidatedMethod;
    module.link("meteor/mdg:validated-method", {
      ValidatedMethod(v) {
        ValidatedMethod = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    let Enrollment;
    module.link("./collection", {
      Enrollment(v) {
        Enrollment = v;
      }
    }, 2);
    let Courses;
    module.link("../courses/collection", {
      Courses(v) {
        Courses = v;
      }
    }, 3);
    let Students;
    module.link("../students/collection", {
      Students(v) {
        Students = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    //insertEnrollment Method
    new ValidatedMethod({
      name: 'insertEnrollment',
      mixins: [],
      validate: new SimpleSchema({
        student_id: {
          type: String
        },
        course_id: {
          type: String
        },
        enrollment_date: {
          type: Date
        },
        enrollment_cost: {
          type: Number
        }
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
          const enrollmentCount = await Enrollment.find({
            course_id: enrollmentData.course_id
          }).countAsync();
          if (enrollmentCount >= 25) {
            throw new Meteor.Error('Course full', 'This course has reached its maximum capacity of 25 students.');
          }

          // Insert the enrollment data into the Enrollment collection
          const enrollmentId = await Enrollment.insertAsync(enrollmentData);
          console.log('Inserted enrollment ID:', enrollmentId);
          return enrollmentId;
        } catch (error) {
          console.error('Error during insert:', error);
          throw new Meteor.Error('Database Error', "Failed to insert enrollment: ".concat(error.message));
        }
      }
    });

    // Fetch Enrollments Method
    new ValidatedMethod({
      name: 'fetchEnrollments',
      mixins: [],
      validate: null,
      // No validation needed for fetching enrollments
      async run() {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to fetch enrollments.');
        }
        try {
          console.log('Fetching all enrollments'); // Log when fetch operation starts
          const enrollmentsList = await Enrollment.find().fetch();
          console.log('Fetched enrollments:', enrollmentsList); // Log the fetched enrollments list
          return enrollmentsList; // Return the list of enrollments
        } catch (error) {
          console.error('Failed to fetch enrollments:', error); // Log any fetch errors
          throw new Meteor.Error('Database Error', "Failed to fetch enrollments: ".concat(error.message));
        }
      }
    });

    // Delete Enrollment Method
    new ValidatedMethod({
      name: 'deleteEnrollment',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        }
      }).validator(),
      async run(_ref) {
        let {
          _id
        } = _ref;
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to delete enrollments.');
        }
        try {
          await Enrollment.removeAsync({
            _id
          });
          return {
            message: 'Enrollment deleted successfully!'
          };
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to delete enrollment: ".concat(error.message));
        }
      }
    });

    // Update Enrollment Method
    new ValidatedMethod({
      name: 'updateEnrollment',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        },
        student_id: {
          type: String
        },
        course_id: {
          type: String
        },
        enrollment_date: {
          type: Date
        },
        enrollment_cost: {
          type: Number
        } // Added enrollment_cost
      }).validator(),
      async run(_ref2) {
        let {
          _id,
          student_id,
          course_id,
          enrollment_date,
          enrollment_cost
        } = _ref2;
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to update enrollments.');
        }
        try {
          await Enrollment.updateAsync({
            _id
          }, {
            $set: {
              student_id,
              course_id,
              enrollment_date,
              enrollment_cost // Added enrollment_cost
            }
          });
          return {
            message: 'Enrollment updated successfully!'
          };
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to update enrollment: ".concat(error.message));
        }
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"students":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/students/collection.js                                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _Students$attachSchem;
    module.export({
      Students: () => Students
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Students = new Mongo.Collection('students');
    const StudentsSchema = new SimpleSchema({
      first_name: {
        type: String,
        label: "First Name",
        max: 50
      },
      last_name: {
        type: String,
        label: "Last Name",
        max: 50
      },
      date_of_birth: {
        type: Date,
        label: "Date of Birth"
      },
      email: {
        type: String,
        label: "Email"
      },
      phone: {
        type: String,
        label: "Phone Number",
        max: 15
      },
      // enrolled_courses: {
      //   type: Array,
      //   label: "Enrolled Courses",
      //   optional: true,
      // },
      // 'enrolled_courses.$': {
      //   type: String, // Assuming course IDs are stored as strings
      // },
      address: {
        type: String,
        label: "Address",
        optional: true // Optional field
      }
    });
    (_Students$attachSchem = Students.attachSchema) === null || _Students$attachSchem === void 0 ? void 0 : _Students$attachSchem.call(Students, StudentsSchema);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/students/index.js                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./methods");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/students/methods.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 0);
    const _excluded = ["_id"];
    let ValidatedMethod;
    module.link("meteor/mdg:validated-method", {
      ValidatedMethod(v) {
        ValidatedMethod = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    let Students;
    module.link("./collection", {
      Students(v) {
        Students = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Ensure this import is correct

    // Insert Student Method
    new ValidatedMethod({
      name: 'insertStudents',
      mixins: [],
      validate: new SimpleSchema({
        first_name: {
          type: String,
          max: 50
        },
        last_name: {
          type: String,
          max: 50
        },
        email: {
          type: String
        },
        // Email validation
        phone: {
          type: String,
          max: 15
        },
        date_of_birth: {
          type: Date
        },
        address: {
          type: String,
          optional: true
        }
      }).validator(),
      async run(studentData) {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to add students.');
        }
        console.log('Inserting student data:', studentData); // Log student data to check the content

        try {
          // Use insertAsync() instead of insert()
          const studentId = await Students.insertAsync(studentData);
          console.log('Inserted student ID:', studentId); // Log the inserted student ID
          return studentId; // Return the student ID on successful insertion
        } catch (error) {
          console.error('Failed to insert student:', error); // Log the actual error
          throw new Meteor.Error('Database Error', "Failed to insert student: ".concat(error.message));
        }
      }
    });

    // Fetch Students Method
    new ValidatedMethod({
      name: 'fetchStudents',
      mixins: [],
      validate: null,
      // No validation needed for fetching students
      async run() {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to fetch students.');
        }
        try {
          console.log('Fetching all students'); // Log when fetch operation starts
          const studentsList = await Students.find().fetch();
          console.log('Fetched students:', studentsList); // Log the fetched students list
          return studentsList; // Return the list of students
        } catch (error) {
          console.error('Failed to fetch students:', error); // Log any fetch errors
          throw new Meteor.Error('Database Error', "Failed to fetch students: ".concat(error.message));
        }
      }
    });

    // Delete Student Method
    new ValidatedMethod({
      name: 'deleteStudent',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        }
      }).validator(),
      async run(_ref) {
        let {
          _id
        } = _ref;
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to delete students.');
        }
        try {
          await Students.removeAsync({
            _id
          });
          return {
            message: 'Student deleted successfully!'
          };
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to delete student: ".concat(error.message));
        }
      }
    });

    // Update Student Method
    new ValidatedMethod({
      name: 'updateStudent',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        },
        first_name: {
          type: String,
          optional: true
        },
        last_name: {
          type: String,
          optional: true
        },
        email: {
          type: String,
          optional: true
        },
        phone: {
          type: String,
          optional: true
        },
        date_of_birth: {
          type: Date,
          optional: true
        },
        address: {
          type: String,
          optional: true
        }
      }).validator(),
      async run(studentData) {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to update students.');
        }
        try {
          const {
              _id
            } = studentData,
            updateData = _objectWithoutProperties(studentData, _excluded);
          return await Students.updateAsync({
            _id
          }, {
            $set: updateData
          });
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to update student: ".concat(error.message));
        }
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"teachers":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/teachers/collection.js                                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _Teachers$attachSchem;
    module.export({
      Teachers: () => Teachers
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Teachers = new Mongo.Collection('teachers');
    const TeachersSchema = new SimpleSchema({
      first_name: {
        type: String,
        label: "First Name"
      },
      last_name: {
        type: String,
        label: "Last Name"
      },
      email: {
        type: String,
        // regEx: emailRegex,
        label: "Email"
      },
      phone: {
        type: String,
        label: "Phone Number"
      },
      subject: {
        type: String,
        label: "Subject"
      }
      // courses_taught: {
      //     type: Array,
      //     label: "Courses Taught",
      //     optional: true,
      // },
      // 'courses_taught.$': {
      //     type: String,  
      // },
    });
    (_Teachers$attachSchem = Teachers.attachSchema) === null || _Teachers$attachSchem === void 0 ? void 0 : _Teachers$attachSchem.call(Teachers, TeachersSchema);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/teachers/index.js                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./methods");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/teachers/methods.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 0);
    const _excluded = ["_id"];
    let ValidatedMethod;
    module.link("meteor/mdg:validated-method", {
      ValidatedMethod(v) {
        ValidatedMethod = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    let Teachers;
    module.link("./collection", {
      Teachers(v) {
        Teachers = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Insert Teacher Method
    new ValidatedMethod({
      name: 'insertTeachers',
      mixins: [],
      validate: new SimpleSchema({
        first_name: {
          type: String
        },
        last_name: {
          type: String
        },
        email: {
          type: String
        },
        phone: {
          type: String
        },
        subject: {
          type: String
        }
        // Removed courses_taught from the schema
      }).validator(),
      async run(teacherData) {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to add teachers.');
        }
        try {
          return await Teachers.insertAsync(teacherData);
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to insert teacher: ".concat(error.message));
        }
      }
    });

    // Fetch All Teachers Method
    new ValidatedMethod({
      name: 'fetchTeachers',
      mixins: [],
      validate: null,
      async run() {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to fetch teachers.');
        }
        try {
          return await Teachers.find().fetch();
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to fetch teachers: ".concat(error.message));
        }
      }
    });

    // Delete Teacher Method
    new ValidatedMethod({
      name: 'deleteTeachers',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        }
      }).validator(),
      async run(_ref) {
        let {
          _id
        } = _ref;
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to delete teachers.');
        }
        try {
          await Teachers.removeAsync({
            _id
          });
          return {
            message: 'គ្រូបានលុបដោយជោគជ័យ!'
          };
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to delete teacher: ".concat(error.message));
        }
      }
    });

    // Update Teacher Method
    new ValidatedMethod({
      name: 'updateTeachers',
      mixins: [],
      validate: new SimpleSchema({
        _id: {
          type: String
        },
        first_name: {
          type: String
        },
        last_name: {
          type: String
        },
        email: {
          type: String
        },
        phone: {
          type: String
        },
        subject: {
          type: String
        }
        // Removed courses_taught from the schema
      }).validator(),
      async run(teacherData) {
        if (!this.userId) {
          throw new Meteor.Error('Not authorized', 'You must be logged in to update teachers.');
        }
        try {
          const {
              _id
            } = teacherData,
            updateData = _objectWithoutProperties(teacherData, _excluded);
          return await Teachers.updateAsync({
            _id
          }, {
            $set: updateData
          });
        } catch (error) {
          throw new Meteor.Error('Database Error', "Failed to update teacher: ".concat(error.message));
        }
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/index.js                                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./Auth/projects");
    module.link("./students");
    module.link("./courses");
    module.link("./teachers");
    module.link("./enrollment");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// server/main.js                                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("../imports/api");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".mjs"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/server/main.js"
  ]
}});

//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvQXV0aC9wcm9qZWN0cy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvY291cnNlcy9jb2xsZWN0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9jb3Vyc2VzL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9jb3Vyc2VzL21ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2Vucm9sbG1lbnQvY29sbGVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvZW5yb2xsbWVudC9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvZW5yb2xsbWVudC9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9zdHVkZW50cy9jb2xsZWN0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9zdHVkZW50cy9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvc3R1ZGVudHMvbWV0aG9kcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvdGVhY2hlcnMvY29sbGVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvdGVhY2hlcnMvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL3RlYWNoZXJzL21ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiZXhwb3J0IiwiVXNlckNsYXNzIiwiTW9uZ28iLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIkNvbGxlY3Rpb24iLCJNZXRlb3IiLCJpc1NlcnZlciIsImFsbG93IiwiaW5zZXJ0IiwidXBkYXRlIiwicmVtb3ZlIiwibWV0aG9kcyIsInVzZXJDbGFzcy5pbnNlcnQiLCJ1c2VyRGF0YSIsInVzZXJJZCIsIkVycm9yIiwib3duZXIiLCJjcmVhdGVkQXQiLCJEYXRlIiwicm9sZSIsInN0YXR1cyIsInVzZXJDbGFzcy51cGRhdGUiLCJ1cGRhdGVzIiwiJHNldCIsInVwZGF0ZWRBdCIsInVzZXJDbGFzcy5yZW1vdmUiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJDb3Vyc2VzIiwiU2ltcGxlU2NoZW1hIiwiQ291cnNlc1NjaGVtYSIsImNvdXJzZV9uYW1lIiwidHlwZSIsIlN0cmluZyIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJ0ZWFjaGVyX2lkIiwiX0NvdXJzZXMkYXR0YWNoU2NoZW1hIiwiYXR0YWNoU2NoZW1hIiwiY2FsbCIsIl9vYmplY3RXaXRob3V0UHJvcGVydGllcyIsIl9leGNsdWRlZCIsIlZhbGlkYXRlZE1ldGhvZCIsIlRlYWNoZXJzIiwibmFtZSIsIm1peGlucyIsInZhbGlkYXRlIiwibWF4Iiwib3B0aW9uYWwiLCJ2YWxpZGF0b3IiLCJydW4iLCJjb3Vyc2VEYXRhIiwiY29uc29sZSIsImxvZyIsInRlYWNoZXIiLCJmaW5kT25lQXN5bmMiLCJjb3Vyc2VJZCIsImluc2VydEFzeW5jIiwiZXJyb3IiLCJjb25jYXQiLCJtZXNzYWdlIiwiY291cnNlc0xpc3QiLCJmaW5kIiwiZmV0Y2giLCJfaWQiLCJfcmVmIiwiY291cnNlIiwicmVtb3ZlQXN5bmMiLCJ1cGRhdGVEYXRhIiwicmVzdWx0IiwidXBkYXRlQXN5bmMiLCJFbnJvbGxtZW50IiwiZW4iLCJFbnJvbGxtZW50U2NoZW1hIiwic3R1ZGVudF9pZCIsImNvdXJzZV9pZCIsImVucm9sbG1lbnRfZGF0ZSIsImVucm9sbG1lbnRfY29zdCIsIk51bWJlciIsIl9FbnJvbGxtZW50JGF0dGFjaFNjaCIsIlN0dWRlbnRzIiwiZW5yb2xsbWVudERhdGEiLCJzdHVkZW50IiwiZW5yb2xsbWVudENvdW50IiwiY291bnRBc3luYyIsImVucm9sbG1lbnRJZCIsImVucm9sbG1lbnRzTGlzdCIsIl9yZWYyIiwiU3R1ZGVudHNTY2hlbWEiLCJmaXJzdF9uYW1lIiwibGFzdF9uYW1lIiwiZGF0ZV9vZl9iaXJ0aCIsImVtYWlsIiwicGhvbmUiLCJhZGRyZXNzIiwiX1N0dWRlbnRzJGF0dGFjaFNjaGVtIiwic3R1ZGVudERhdGEiLCJzdHVkZW50SWQiLCJzdHVkZW50c0xpc3QiLCJUZWFjaGVyc1NjaGVtYSIsInN1YmplY3QiLCJfVGVhY2hlcnMkYXR0YWNoU2NoZW0iLCJ0ZWFjaGVyRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBckdILE1BQU0sQ0FBQ0ksTUFBTSxDQUFDO01BQUNDLFNBQVMsRUFBQ0EsQ0FBQSxLQUFJQTtJQUFTLENBQUMsQ0FBQztJQUFDLElBQUlDLEtBQUs7SUFBQ04sTUFBTSxDQUFDQyxJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNLLEtBQUtBLENBQUNILENBQUMsRUFBQztRQUFDRyxLQUFLLEdBQUNILENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMxSixNQUFNRixTQUFTLEdBQUcsSUFBSUMsS0FBSyxDQUFDRSxVQUFVLENBQUMsV0FBVyxDQUFDO0lBRTFEO0lBQ0EsSUFBSUMsTUFBTSxDQUFDQyxRQUFRLEVBQUU7TUFDbkJMLFNBQVMsQ0FBQ00sS0FBSyxDQUFDO1FBQ2RDLE1BQU0s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Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5leHBvcnQgY29uc3QgVXNlckNsYXNzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3VzZXJDbGFzcycpO1xyXG5cclxuLy8gU2VjdXJpdHkgcnVsZXMgKHNlcnZlci1zaWRlIG9ubHkpXHJcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICBVc2VyQ2xhc3MuYWxsb3coe1xyXG4gICAgaW5zZXJ0OiAoKSA9PiBmYWxzZSwgLy8gRGlzYWxsb3cgZGlyZWN0IGluc2VydHNcclxuICAgIHVwZGF0ZTogKCkgPT4gZmFsc2UsIC8vIERpc2FsbG93IGRpcmVjdCB1cGRhdGVzXHJcbiAgICByZW1vdmU6ICgpID0+IGZhbHNlIC8vIERpc2FsbG93IGRpcmVjdCByZW1vdmVzXHJcbiAgfSk7XHJcbn1cclxuXHJcbiBNZXRlb3IubWV0aG9kcyh7XHJcbiAgJ3VzZXJDbGFzcy5pbnNlcnQnKHVzZXJEYXRhKSB7XHJcbiAgICBpZiAoIXRoaXMudXNlcklkKSB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgYXV0aG9yaXplZCcpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gVXNlckNsYXNzLmluc2VydCh7XHJcbiAgICAgIC4uLnVzZXJEYXRhLFxyXG4gICAgICBvd25lcjogdGhpcy51c2VySWQsXHJcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcclxuICAgICAgcm9sZTogJ3VzZXInLCAvLyBEZWZhdWx0IHJvbGVcclxuICAgICAgc3RhdHVzOiAnYWN0aXZlJ1xyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgJ3VzZXJDbGFzcy51cGRhdGUnKHVzZXJJZCwgdXBkYXRlcykge1xyXG4gICAgaWYgKCF0aGlzLnVzZXJJZCB8fCB0aGlzLnVzZXJJZCAhPT0gdXNlcklkKSB7XHJcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBVc2VyQ2xhc3MudXBkYXRlKHVzZXJJZCwge1xyXG4gICAgICAkc2V0OiB7XHJcbiAgICAgICAgLi4udXBkYXRlcyxcclxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKClcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgJ3VzZXJDbGFzcy5yZW1vdmUnKHVzZXJJZCkge1xyXG4gICAgaWYgKCF0aGlzLnVzZXJJZCB8fCB0aGlzLnVzZXJJZCAhPT0gdXNlcklkKSB7XHJcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVXNlckNsYXNzLnJlbW92ZSh1c2VySWQpO1xyXG4gIH1cclxufSk7IiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XHJcblxyXG5leHBvcnQgY29uc3QgQ291cnNlcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdjb3Vyc2VzJyk7XHJcblxyXG5jb25zdCBDb3Vyc2VzU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBjb3Vyc2VfbmFtZToge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICBsYWJlbDogXCJDb3Vyc2UgTmFtZVwiLFxyXG4gICAgfSxcclxuICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiBcIkNvdXJzZSBEZXNjcmlwdGlvblwiLFxyXG4gICAgfSxcclxuICAgIHRlYWNoZXJfaWQ6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6IFwiVGVhY2hlciBJRFwiLFxyXG4gICAgfVxyXG59KTtcclxuXHJcbkNvdXJzZXMuYXR0YWNoU2NoZW1hPy4oQ291cnNlc1NjaGVtYSk7XHJcblxyXG4iLCJpbXBvcnQgXCIuL21ldGhvZHNcIjsiLCJpbXBvcnQgeyBWYWxpZGF0ZWRNZXRob2QgfSBmcm9tICdtZXRlb3IvbWRnOnZhbGlkYXRlZC1tZXRob2QnO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XHJcbmltcG9ydCB7IENvdXJzZXMgfSBmcm9tICcuL2NvbGxlY3Rpb24nO1xyXG5pbXBvcnQgeyBUZWFjaGVycyB9IGZyb20gJy4uL3RlYWNoZXJzL2NvbGxlY3Rpb24nO1xyXG5cclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ2luc2VydENvdXJzZScsXHJcbiAgICBtaXhpbnM6IFtdLFxyXG4gICAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgICAgIGNvdXJzZV9uYW1lOiB7IHR5cGU6IFN0cmluZywgbWF4OiAxMDAgfSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgICAgICAgdGVhY2hlcl9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIH0pLnZhbGlkYXRvcigpLFxyXG4gICAgYXN5bmMgcnVuKGNvdXJzZURhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgY291cnNlIGRhdGE6JywgY291cnNlRGF0YSk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IGF1dGhvcml6ZWQnLCAnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIGFkZCBjb3Vyc2VzLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gTG9nIFRlYWNoZXJzIGNvbGxlY3Rpb24gdG8gbWFrZSBzdXJlIGl0J3MgYWNjZXNzaWJsZVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVGVhY2hlcnMgY29sbGVjdGlvbjonLCBUZWFjaGVycyk7XHJcblxyXG4gICAgICAgICAgICAvLyBFbnN1cmUgdGVhY2hlciBleGlzdHNcclxuICAgICAgICAgICAgY29uc3QgdGVhY2hlciA9IGF3YWl0IFRlYWNoZXJzLmZpbmRPbmVBc3luYyhjb3Vyc2VEYXRhLnRlYWNoZXJfaWQpO1xyXG4gICAgICAgICAgICBpZiAoIXRlYWNoZXIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0ludmFsaWQgdGVhY2hlcicsICdUaGUgc3BlY2lmaWVkIHRlYWNoZXIgZG9lcyBub3QgZXhpc3QuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUZWFjaGVyIGZvdW5kOicsIHRlYWNoZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBjb3Vyc2UgZGF0YSBpbnRvIHRoZSBDb3Vyc2VzIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgY291cnNlSWQgPSBhd2FpdCBDb3Vyc2VzLmluc2VydEFzeW5jKGNvdXJzZURhdGEpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnSW5zZXJ0ZWQgY291cnNlIElEOicsIGNvdXJzZUlkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb3Vyc2VJZDtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgaW5zZXJ0OicsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignRGF0YWJhc2UgRXJyb3InLCBgRmFpbGVkIHRvIGluc2VydCBjb3Vyc2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuXHJcbi8vIEZldGNoIENvdXJzZXMgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ2ZldGNoQ291cnNlcycsXHJcbiAgICBtaXhpbnM6IFtdLFxyXG4gICAgdmFsaWRhdGU6IG51bGwsIC8vIE5vIHZhbGlkYXRpb24gbmVlZGVkIGZvciBmZXRjaGluZyBjb3Vyc2VzXHJcbiAgICBhc3luYyBydW4oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgYXV0aG9yaXplZCcsICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gZmV0Y2ggY291cnNlcy4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGluZyBhbGwgY291cnNlcycpOyAgLy8gTG9nIHdoZW4gZmV0Y2ggb3BlcmF0aW9uIHN0YXJ0c1xyXG4gICAgICAgICAgICBjb25zdCBjb3Vyc2VzTGlzdCA9IGF3YWl0IENvdXJzZXMuZmluZCgpLmZldGNoKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGVkIGNvdXJzZXM6JywgY291cnNlc0xpc3QpOyAgLy8gTG9nIHRoZSBmZXRjaGVkIGNvdXJzZXMgbGlzdFxyXG4gICAgICAgICAgICByZXR1cm4gY291cnNlc0xpc3Q7IC8vIFJldHVybiB0aGUgbGlzdCBvZiBjb3Vyc2VzXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIGNvdXJzZXM6JywgZXJyb3IpOyAgLy8gTG9nIGFueSBmZXRjaCBlcnJvcnNcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignRGF0YWJhc2UgRXJyb3InLCBgRmFpbGVkIHRvIGZldGNoIGNvdXJzZXM6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuXHJcbi8vIERlbGV0ZSBDb3Vyc2UgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ2RlbGV0ZUNvdXJzZScsXHJcbiAgICBtaXhpbnM6IFtdLFxyXG4gICAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgICAgIF9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIH0pLnZhbGlkYXRvcigpLFxyXG4gICAgYXN5bmMgcnVuKHsgX2lkIH0pIHtcclxuICAgICAgICBpZiAoIXRoaXMudXNlcklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJywgJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBkZWxldGUgY291cnNlcy4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdXJzZSA9IGF3YWl0IENvdXJzZXMuZmluZE9uZUFzeW5jKHsgX2lkIH0pO1xyXG4gICAgICAgICAgICBpZiAoIWNvdXJzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignQ291cnNlIG5vdCBmb3VuZCcsICdUaGUgY291cnNlIHlvdSBhcmUgdHJ5aW5nIHRvIGRlbGV0ZSBkb2VzIG5vdCBleGlzdC4nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXdhaXQgQ291cnNlcy5yZW1vdmVBc3luYyh7IF9pZCB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYERlbGV0ZWQgY291cnNlIHdpdGggSUQ6ICR7X2lkfWApO1xyXG4gICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlOiAnQ291cnNlIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5IScgfTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZGVsZXRlIGNvdXJzZTonLCBlcnJvcik7ICAvLyBMb2cgdGhlIGFjdHVhbCBlcnJvclxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdEYXRhYmFzZSBFcnJvcicsIGBGYWlsZWQgdG8gZGVsZXRlIGNvdXJzZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pO1xyXG5cclxuLy8gVXBkYXRlIENvdXJzZSBNZXRob2RcclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgICBuYW1lOiAndXBkYXRlQ291cnNlJyxcclxuICAgIG1peGluczogW10sXHJcbiAgICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICAgICAgX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgICAgIGNvdXJzZV9uYW1lOiB7IHR5cGU6IFN0cmluZywgb3B0aW9uYWw6IHRydWUgfSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgICAgICAgdGVhY2hlcl9pZDogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgICB9KS52YWxpZGF0b3IoKSxcclxuICAgIGFzeW5jIHJ1bihjb3Vyc2VEYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgYXV0aG9yaXplZCcsICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gdXBkYXRlIGNvdXJzZXMuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IF9pZCwgLi4udXBkYXRlRGF0YSB9ID0gY291cnNlRGF0YTtcclxuXHJcbiAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgY291cnNlIGV4aXN0cyBiZWZvcmUgdXBkYXRpbmdcclxuICAgICAgICAgICAgY29uc3QgY291cnNlID0gYXdhaXQgQ291cnNlcy5maW5kT25lQXN5bmMoeyBfaWQgfSk7XHJcbiAgICAgICAgICAgIGlmICghY291cnNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdDb3Vyc2Ugbm90IGZvdW5kJywgJ1RoZSBjb3Vyc2UgeW91IGFyZSB0cnlpbmcgdG8gdXBkYXRlIGRvZXMgbm90IGV4aXN0LicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGNvdXJzZSBpbiB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb3Vyc2VzLnVwZGF0ZUFzeW5jKHsgX2lkIH0sIHsgJHNldDogdXBkYXRlRGF0YSB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVwZGF0ZWQgY291cnNlIHdpdGggSUQ6ICR7X2lkfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgY291cnNlOicsIGVycm9yKTsgIC8vIExvZyB0aGUgYWN0dWFsIGVycm9yXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0RhdGFiYXNlIEVycm9yJywgYEZhaWxlZCB0byB1cGRhdGUgY291cnNlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxufSk7XHJcbiIsIi8vIGltcG9ydCB7IGVuIH0gZnJvbSAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZXMubWpzJztcclxuaW1wb3J0IHsgZW4gfSBmcm9tICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlcy5tanMnO1xyXG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcclxuXHJcbmV4cG9ydCBjb25zdCBFbnJvbGxtZW50ID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ2Vucm9sbG1lbnQnKTtcclxuXHJcbmNvbnN0IEVucm9sbG1lbnRTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICAgXHJcbiAgICBzdHVkZW50X2lkOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiBcIlN0dWRlbnQgSURcIixcclxuICAgIH0sXHJcbiAgICBjb3Vyc2VfaWQ6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6IFwiQ291cnNlIElEXCIsXHJcbiAgICB9LFxyXG4gICAgZW5yb2xsbWVudF9kYXRlOiB7XHJcbiAgICAgICAgdHlwZTogRGF0ZSxcclxuICAgICAgICBsYWJlbDogXCJFbnJvbGxtZW50IERhdGVcIixcclxuICAgIH0sXHJcbiAgICBlbnJvbGxtZW50X2Nvc3Q6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6IFwiRW5yb2xsbWVudCBDb3N0XCIsXHJcbiAgICB9LFxyXG59KTtcclxuXHJcbkVucm9sbG1lbnQuYXR0YWNoU2NoZW1hPy4oRW5yb2xsbWVudFNjaGVtYSk7XHJcblxyXG4iLCJpbXBvcnQgXCIuL21ldGhvZHNcIjsiLCJpbXBvcnQgeyBWYWxpZGF0ZWRNZXRob2QgfSBmcm9tICdtZXRlb3IvbWRnOnZhbGlkYXRlZC1tZXRob2QnO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XHJcbmltcG9ydCB7IEVucm9sbG1lbnQgfSBmcm9tICcuL2NvbGxlY3Rpb24nO1xyXG5pbXBvcnQgeyBDb3Vyc2VzIH0gZnJvbSAnLi4vY291cnNlcy9jb2xsZWN0aW9uJztcclxuaW1wb3J0IHsgU3R1ZGVudHMgfSBmcm9tICcuLi9zdHVkZW50cy9jb2xsZWN0aW9uJztcclxuXHJcbi8vaW5zZXJ0RW5yb2xsbWVudCBNZXRob2RcclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgICBuYW1lOiAnaW5zZXJ0RW5yb2xsbWVudCcsXHJcbiAgICBtaXhpbnM6IFtdLFxyXG4gICAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgICAgIHN0dWRlbnRfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICAgICAgY291cnNlX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgICAgIGVucm9sbG1lbnRfZGF0ZTogeyB0eXBlOiBEYXRlIH0sXHJcbiAgICAgICAgZW5yb2xsbWVudF9jb3N0OiB7IHR5cGU6IE51bWJlciB9LFxyXG4gICAgfSkudmFsaWRhdG9yKCksXHJcbiAgICBhc3luYyBydW4oZW5yb2xsbWVudERhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgZW5yb2xsbWVudCBkYXRhOicsIGVucm9sbG1lbnREYXRhKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJJZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgYXV0aG9yaXplZCcsICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gZW5yb2xsIGluIGNvdXJzZXMuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBFbnN1cmUgY291cnNlIGV4aXN0c1xyXG4gICAgICAgICAgICBjb25zdCBjb3Vyc2UgPSBhd2FpdCBDb3Vyc2VzLmZpbmRPbmVBc3luYyhlbnJvbGxtZW50RGF0YS5jb3Vyc2VfaWQpO1xyXG4gICAgICAgICAgICBpZiAoIWNvdXJzZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignSW52YWxpZCBjb3Vyc2UnLCAnVGhlIHNwZWNpZmllZCBjb3Vyc2UgZG9lcyBub3QgZXhpc3QuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb3Vyc2UgZm91bmQ6JywgY291cnNlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEVuc3VyZSBzdHVkZW50IGV4aXN0c1xyXG4gICAgICAgICAgICBjb25zdCBzdHVkZW50ID0gYXdhaXQgU3R1ZGVudHMuZmluZE9uZUFzeW5jKGVucm9sbG1lbnREYXRhLnN0dWRlbnRfaWQpO1xyXG4gICAgICAgICAgICBpZiAoIXN0dWRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0ludmFsaWQgc3R1ZGVudCcsICdUaGUgc3BlY2lmaWVkIHN0dWRlbnQgZG9lcyBub3QgZXhpc3QuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdHVkZW50IGZvdW5kOicsIHN0dWRlbnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgY3VycmVudCBlbnJvbGxtZW50IGNvdW50IGZvciB0aGUgY291cnNlXHJcbiAgICAgICAgICAgIGNvbnN0IGVucm9sbG1lbnRDb3VudCA9IGF3YWl0IEVucm9sbG1lbnQuZmluZCh7IGNvdXJzZV9pZDogZW5yb2xsbWVudERhdGEuY291cnNlX2lkIH0pLmNvdW50QXN5bmMoKTtcclxuICAgICAgICAgICAgaWYgKGVucm9sbG1lbnRDb3VudCA+PSAyNSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignQ291cnNlIGZ1bGwnLCAnVGhpcyBjb3Vyc2UgaGFzIHJlYWNoZWQgaXRzIG1heGltdW0gY2FwYWNpdHkgb2YgMjUgc3R1ZGVudHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgZW5yb2xsbWVudCBkYXRhIGludG8gdGhlIEVucm9sbG1lbnQgY29sbGVjdGlvblxyXG4gICAgICAgICAgICBjb25zdCBlbnJvbGxtZW50SWQgPSBhd2FpdCBFbnJvbGxtZW50Lmluc2VydEFzeW5jKGVucm9sbG1lbnREYXRhKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0luc2VydGVkIGVucm9sbG1lbnQgSUQ6JywgZW5yb2xsbWVudElkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBlbnJvbGxtZW50SWQ7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZHVyaW5nIGluc2VydDonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0RhdGFiYXNlIEVycm9yJywgYEZhaWxlZCB0byBpbnNlcnQgZW5yb2xsbWVudDogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pO1xyXG5cclxuLy8gRmV0Y2ggRW5yb2xsbWVudHMgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ2ZldGNoRW5yb2xsbWVudHMnLFxyXG4gICAgbWl4aW5zOiBbXSxcclxuICAgIHZhbGlkYXRlOiBudWxsLCAvLyBObyB2YWxpZGF0aW9uIG5lZWRlZCBmb3IgZmV0Y2hpbmcgZW5yb2xsbWVudHNcclxuICAgIGFzeW5jIHJ1bigpIHtcclxuICAgICAgICBpZiAoIXRoaXMudXNlcklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJywgJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBmZXRjaCBlbnJvbGxtZW50cy4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGluZyBhbGwgZW5yb2xsbWVudHMnKTsgIC8vIExvZyB3aGVuIGZldGNoIG9wZXJhdGlvbiBzdGFydHNcclxuICAgICAgICAgICAgY29uc3QgZW5yb2xsbWVudHNMaXN0ID0gYXdhaXQgRW5yb2xsbWVudC5maW5kKCkuZmV0Y2goKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZldGNoZWQgZW5yb2xsbWVudHM6JywgZW5yb2xsbWVudHNMaXN0KTsgIC8vIExvZyB0aGUgZmV0Y2hlZCBlbnJvbGxtZW50cyBsaXN0XHJcbiAgICAgICAgICAgIHJldHVybiBlbnJvbGxtZW50c0xpc3Q7IC8vIFJldHVybiB0aGUgbGlzdCBvZiBlbnJvbGxtZW50c1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBlbnJvbGxtZW50czonLCBlcnJvcik7ICAvLyBMb2cgYW55IGZldGNoIGVycm9yc1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdEYXRhYmFzZSBFcnJvcicsIGBGYWlsZWQgdG8gZmV0Y2ggZW5yb2xsbWVudHM6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuXHJcbi8vIERlbGV0ZSBFbnJvbGxtZW50IE1ldGhvZFxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICAgIG5hbWU6ICdkZWxldGVFbnJvbGxtZW50JyxcclxuICAgIG1peGluczogW10sXHJcbiAgICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICAgICAgX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgfSkudmFsaWRhdG9yKCksXHJcbiAgICBhc3luYyBydW4oeyBfaWQgfSkge1xyXG4gICAgICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IGF1dGhvcml6ZWQnLCAnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIGRlbGV0ZSBlbnJvbGxtZW50cy4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IEVucm9sbG1lbnQucmVtb3ZlQXN5bmMoeyBfaWQgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6ICdFbnJvbGxtZW50IGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5IScgfTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdEYXRhYmFzZSBFcnJvcicsIGBGYWlsZWQgdG8gZGVsZXRlIGVucm9sbG1lbnQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuXHJcbi8vIFVwZGF0ZSBFbnJvbGxtZW50IE1ldGhvZFxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICAgIG5hbWU6ICd1cGRhdGVFbnJvbGxtZW50JyxcclxuICAgIG1peGluczogW10sXHJcbiAgICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICAgICAgX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgICAgIHN0dWRlbnRfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICAgICAgY291cnNlX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgICAgIGVucm9sbG1lbnRfZGF0ZTogeyB0eXBlOiBEYXRlIH0sXHJcbiAgICAgICAgZW5yb2xsbWVudF9jb3N0OiB7IHR5cGU6IE51bWJlciB9LCAvLyBBZGRlZCBlbnJvbGxtZW50X2Nvc3RcclxuICAgIH0pLnZhbGlkYXRvcigpLFxyXG4gICAgYXN5bmMgcnVuKHsgX2lkLCBzdHVkZW50X2lkLCBjb3Vyc2VfaWQsIGVucm9sbG1lbnRfZGF0ZSwgZW5yb2xsbWVudF9jb3N0IH0pIHtcclxuICAgICAgICBpZiAoIXRoaXMudXNlcklkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJywgJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byB1cGRhdGUgZW5yb2xsbWVudHMuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBFbnJvbGxtZW50LnVwZGF0ZUFzeW5jKHsgX2lkIH0sIHtcclxuICAgICAgICAgICAgICAgICRzZXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50X2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdXJzZV9pZCxcclxuICAgICAgICAgICAgICAgICAgICBlbnJvbGxtZW50X2RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5yb2xsbWVudF9jb3N0LCAvLyBBZGRlZCBlbnJvbGxtZW50X2Nvc3RcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogJ0Vucm9sbG1lbnQgdXBkYXRlZCBzdWNjZXNzZnVsbHkhJyB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0RhdGFiYXNlIEVycm9yJywgYEZhaWxlZCB0byB1cGRhdGUgZW5yb2xsbWVudDogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcclxuXHJcblxyXG5leHBvcnQgY29uc3QgU3R1ZGVudHMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbignc3R1ZGVudHMnKTtcclxuXHJcbmNvbnN0IFN0dWRlbnRzU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgZmlyc3RfbmFtZToge1xyXG4gICAgdHlwZTogU3RyaW5nLFxyXG4gICAgbGFiZWw6IFwiRmlyc3QgTmFtZVwiLFxyXG4gICAgbWF4OiA1MCxcclxuICB9LFxyXG4gIGxhc3RfbmFtZToge1xyXG4gICAgdHlwZTogU3RyaW5nLFxyXG4gICAgbGFiZWw6IFwiTGFzdCBOYW1lXCIsXHJcbiAgICBtYXg6IDUwLFxyXG4gIH0sXHJcbiAgZGF0ZV9vZl9iaXJ0aDoge1xyXG4gICAgdHlwZTogRGF0ZSxcclxuICAgIGxhYmVsOiBcIkRhdGUgb2YgQmlydGhcIixcclxuICB9LFxyXG4gIGVtYWlsOiB7XHJcbiAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICBsYWJlbDogXCJFbWFpbFwiLFxyXG4gIH0sXHJcbiAgcGhvbmU6IHtcclxuICAgIHR5cGU6IFN0cmluZyxcclxuICAgIGxhYmVsOiBcIlBob25lIE51bWJlclwiLFxyXG4gICAgbWF4OiAxNSxcclxuICB9LFxyXG4gIC8vIGVucm9sbGVkX2NvdXJzZXM6IHtcclxuICAvLyAgIHR5cGU6IEFycmF5LFxyXG4gIC8vICAgbGFiZWw6IFwiRW5yb2xsZWQgQ291cnNlc1wiLFxyXG4gIC8vICAgb3B0aW9uYWw6IHRydWUsXHJcbiAgLy8gfSxcclxuICAvLyAnZW5yb2xsZWRfY291cnNlcy4kJzoge1xyXG4gIC8vICAgdHlwZTogU3RyaW5nLCAvLyBBc3N1bWluZyBjb3Vyc2UgSURzIGFyZSBzdG9yZWQgYXMgc3RyaW5nc1xyXG4gIC8vIH0sXHJcbiAgYWRkcmVzczoge1xyXG4gICAgdHlwZTogU3RyaW5nLFxyXG4gICAgbGFiZWw6IFwiQWRkcmVzc1wiLFxyXG4gICAgb3B0aW9uYWw6IHRydWUsIC8vIE9wdGlvbmFsIGZpZWxkXHJcbiAgfSxcclxufSk7XHJcblxyXG5TdHVkZW50cy5hdHRhY2hTY2hlbWE/LihTdHVkZW50c1NjaGVtYSk7XHJcbiIsImltcG9ydCBcIi4vbWV0aG9kc1wiOyIsImltcG9ydCB7IFZhbGlkYXRlZE1ldGhvZCB9IGZyb20gJ21ldGVvci9tZGc6dmFsaWRhdGVkLW1ldGhvZCc7XHJcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcclxuaW1wb3J0IHsgU3R1ZGVudHMgfSBmcm9tICcuL2NvbGxlY3Rpb24nOyAvLyBFbnN1cmUgdGhpcyBpbXBvcnQgaXMgY29ycmVjdFxyXG5cclxuLy8gSW5zZXJ0IFN0dWRlbnQgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gIG5hbWU6ICdpbnNlcnRTdHVkZW50cycsXHJcbiAgbWl4aW5zOiBbXSxcclxuICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBmaXJzdF9uYW1lOiB7IHR5cGU6IFN0cmluZywgbWF4OiA1MCB9LFxyXG4gICAgbGFzdF9uYW1lOiB7IHR5cGU6IFN0cmluZywgbWF4OiA1MCB9LFxyXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nIH0sIC8vIEVtYWlsIHZhbGlkYXRpb25cclxuICAgIHBob25lOiB7IHR5cGU6IFN0cmluZywgbWF4OiAxNSB9LFxyXG4gICAgZGF0ZV9vZl9iaXJ0aDogeyB0eXBlOiBEYXRlIH0sXHJcbiAgICBhZGRyZXNzOiB7IHR5cGU6IFN0cmluZywgb3B0aW9uYWw6IHRydWUgfSxcclxuICB9KS52YWxpZGF0b3IoKSxcclxuICBhc3luYyBydW4oc3R1ZGVudERhdGEpIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IGF1dGhvcml6ZWQnLCAnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIGFkZCBzdHVkZW50cy4nKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnSW5zZXJ0aW5nIHN0dWRlbnQgZGF0YTonLCBzdHVkZW50RGF0YSk7ICAvLyBMb2cgc3R1ZGVudCBkYXRhIHRvIGNoZWNrIHRoZSBjb250ZW50XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVXNlIGluc2VydEFzeW5jKCkgaW5zdGVhZCBvZiBpbnNlcnQoKVxyXG4gICAgICBjb25zdCBzdHVkZW50SWQgPSBhd2FpdCBTdHVkZW50cy5pbnNlcnRBc3luYyhzdHVkZW50RGF0YSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdJbnNlcnRlZCBzdHVkZW50IElEOicsIHN0dWRlbnRJZCk7ICAvLyBMb2cgdGhlIGluc2VydGVkIHN0dWRlbnQgSURcclxuICAgICAgcmV0dXJuIHN0dWRlbnRJZDsgLy8gUmV0dXJuIHRoZSBzdHVkZW50IElEIG9uIHN1Y2Nlc3NmdWwgaW5zZXJ0aW9uXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW5zZXJ0IHN0dWRlbnQ6JywgZXJyb3IpOyAgLy8gTG9nIHRoZSBhY3R1YWwgZXJyb3JcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignRGF0YWJhc2UgRXJyb3InLCBgRmFpbGVkIHRvIGluc2VydCBzdHVkZW50OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcblxyXG4vLyBGZXRjaCBTdHVkZW50cyBNZXRob2RcclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgbmFtZTogJ2ZldGNoU3R1ZGVudHMnLFxyXG4gIG1peGluczogW10sXHJcbiAgdmFsaWRhdGU6IG51bGwsIC8vIE5vIHZhbGlkYXRpb24gbmVlZGVkIGZvciBmZXRjaGluZyBzdHVkZW50c1xyXG4gIGFzeW5jIHJ1bigpIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IGF1dGhvcml6ZWQnLCAnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIGZldGNoIHN0dWRlbnRzLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGluZyBhbGwgc3R1ZGVudHMnKTsgIC8vIExvZyB3aGVuIGZldGNoIG9wZXJhdGlvbiBzdGFydHNcclxuICAgICAgY29uc3Qgc3R1ZGVudHNMaXN0ID0gYXdhaXQgU3R1ZGVudHMuZmluZCgpLmZldGNoKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGZXRjaGVkIHN0dWRlbnRzOicsIHN0dWRlbnRzTGlzdCk7ICAvLyBMb2cgdGhlIGZldGNoZWQgc3R1ZGVudHMgbGlzdFxyXG4gICAgICByZXR1cm4gc3R1ZGVudHNMaXN0OyAvLyBSZXR1cm4gdGhlIGxpc3Qgb2Ygc3R1ZGVudHNcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBzdHVkZW50czonLCBlcnJvcik7ICAvLyBMb2cgYW55IGZldGNoIGVycm9yc1xyXG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdEYXRhYmFzZSBFcnJvcicsIGBGYWlsZWQgdG8gZmV0Y2ggc3R1ZGVudHM6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICB9LFxyXG59KTtcclxuXHJcbi8vIERlbGV0ZSBTdHVkZW50IE1ldGhvZFxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICBuYW1lOiAnZGVsZXRlU3R1ZGVudCcsXHJcbiAgbWl4aW5zOiBbXSxcclxuICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgfSkudmFsaWRhdG9yKCksXHJcbiAgYXN5bmMgcnVuKHsgX2lkIH0pIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IGF1dGhvcml6ZWQnLCAnWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIGRlbGV0ZSBzdHVkZW50cy4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBTdHVkZW50cy5yZW1vdmVBc3luYyh7IF9pZCB9KTtcclxuICAgICAgcmV0dXJuIHsgbWVzc2FnZTogJ1N0dWRlbnQgZGVsZXRlZCBzdWNjZXNzZnVsbHkhJyB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignRGF0YWJhc2UgRXJyb3InLCBgRmFpbGVkIHRvIGRlbGV0ZSBzdHVkZW50OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcblxyXG4vLyBVcGRhdGUgU3R1ZGVudCBNZXRob2RcclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgbmFtZTogJ3VwZGF0ZVN0dWRlbnQnLFxyXG4gIG1peGluczogW10sXHJcbiAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgZmlyc3RfbmFtZTogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgICBsYXN0X25hbWU6IHsgdHlwZTogU3RyaW5nLCBvcHRpb25hbDogdHJ1ZSB9LFxyXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nLCBvcHRpb25hbDogdHJ1ZSB9LFxyXG4gICAgcGhvbmU6IHsgdHlwZTogU3RyaW5nLCBvcHRpb25hbDogdHJ1ZSB9LFxyXG4gICAgZGF0ZV9vZl9iaXJ0aDogeyB0eXBlOiBEYXRlLCBvcHRpb25hbDogdHJ1ZSB9LFxyXG4gICAgYWRkcmVzczogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgfSkudmFsaWRhdG9yKCksXHJcbiAgYXN5bmMgcnVuKHN0dWRlbnREYXRhKSB7XHJcbiAgICBpZiAoIXRoaXMudXNlcklkKSB7XHJcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBhdXRob3JpemVkJywgJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byB1cGRhdGUgc3R1ZGVudHMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgeyBfaWQsIC4uLnVwZGF0ZURhdGEgfSA9IHN0dWRlbnREYXRhO1xyXG4gICAgICByZXR1cm4gYXdhaXQgU3R1ZGVudHMudXBkYXRlQXN5bmMoeyBfaWQgfSwgeyAkc2V0OiB1cGRhdGVEYXRhIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignRGF0YWJhc2UgRXJyb3InLCBgRmFpbGVkIHRvIHVwZGF0ZSBzdHVkZW50OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcbiIsImltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcclxuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xyXG5cclxuLy8gY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRlYWNoZXJzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3RlYWNoZXJzJyk7XHJcblxyXG5jb25zdCBUZWFjaGVyc1NjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgZmlyc3RfbmFtZToge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICBsYWJlbDogXCJGaXJzdCBOYW1lXCIsXHJcbiAgICB9LFxyXG4gICAgbGFzdF9uYW1lOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiBcIkxhc3QgTmFtZVwiLFxyXG4gICAgfSxcclxuICAgIGVtYWlsOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIC8vIHJlZ0V4OiBlbWFpbFJlZ2V4LFxyXG4gICAgICAgIGxhYmVsOiBcIkVtYWlsXCIsXHJcbiAgICB9LFxyXG4gICAgcGhvbmU6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6IFwiUGhvbmUgTnVtYmVyXCIsXHJcbiAgICB9LFxyXG4gICAgc3ViamVjdDoge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICBsYWJlbDogXCJTdWJqZWN0XCIsXHJcbiAgICB9LFxyXG4gICAgLy8gY291cnNlc190YXVnaHQ6IHtcclxuICAgIC8vICAgICB0eXBlOiBBcnJheSxcclxuICAgIC8vICAgICBsYWJlbDogXCJDb3Vyc2VzIFRhdWdodFwiLFxyXG4gICAgLy8gICAgIG9wdGlvbmFsOiB0cnVlLFxyXG4gICAgLy8gfSxcclxuICAgIC8vICdjb3Vyc2VzX3RhdWdodC4kJzoge1xyXG4gICAgLy8gICAgIHR5cGU6IFN0cmluZywgIFxyXG4gICAgLy8gfSxcclxufSk7XHJcblxyXG5UZWFjaGVycy5hdHRhY2hTY2hlbWE/LihUZWFjaGVyc1NjaGVtYSk7XHJcblxyXG4iLCJpbXBvcnQgXCIuL21ldGhvZHNcIjsiLCJpbXBvcnQgeyBWYWxpZGF0ZWRNZXRob2QgfSBmcm9tICdtZXRlb3IvbWRnOnZhbGlkYXRlZC1tZXRob2QnO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XHJcbmltcG9ydCB7IFRlYWNoZXJzIH0gZnJvbSAnLi9jb2xsZWN0aW9uJztcclxuXHJcbi8vIEluc2VydCBUZWFjaGVyIE1ldGhvZFxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICBuYW1lOiAnaW5zZXJ0VGVhY2hlcnMnLFxyXG4gIG1peGluczogW10sXHJcbiAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgZmlyc3RfbmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGxhc3RfbmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGVtYWlsOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgcGhvbmU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICBzdWJqZWN0OiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgLy8gUmVtb3ZlZCBjb3Vyc2VzX3RhdWdodCBmcm9tIHRoZSBzY2hlbWFcclxuICB9KS52YWxpZGF0b3IoKSxcclxuICBhc3luYyBydW4odGVhY2hlckRhdGEpIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcclxuICAgICAgICAnTm90IGF1dGhvcml6ZWQnLFxyXG4gICAgICAgICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gYWRkIHRlYWNoZXJzLidcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgVGVhY2hlcnMuaW5zZXJ0QXN5bmModGVhY2hlckRhdGEpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcclxuICAgICAgICAnRGF0YWJhc2UgRXJyb3InLFxyXG4gICAgICAgIGBGYWlsZWQgdG8gaW5zZXJ0IHRlYWNoZXI6ICR7ZXJyb3IubWVzc2FnZX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcblxyXG4vLyBGZXRjaCBBbGwgVGVhY2hlcnMgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gIG5hbWU6ICdmZXRjaFRlYWNoZXJzJyxcclxuICBtaXhpbnM6IFtdLFxyXG4gIHZhbGlkYXRlOiBudWxsLFxyXG4gIGFzeW5jIHJ1bigpIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcclxuICAgICAgICAnTm90IGF1dGhvcml6ZWQnLFxyXG4gICAgICAgICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gZmV0Y2ggdGVhY2hlcnMuJ1xyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBhd2FpdCBUZWFjaGVycy5maW5kKCkuZmV0Y2goKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXHJcbiAgICAgICAgJ0RhdGFiYXNlIEVycm9yJyxcclxuICAgICAgICBgRmFpbGVkIHRvIGZldGNoIHRlYWNoZXJzOiAke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH0sXHJcbn0pO1xyXG5cclxuLy8gRGVsZXRlIFRlYWNoZXIgTWV0aG9kXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gIG5hbWU6ICdkZWxldGVUZWFjaGVycycsXHJcbiAgbWl4aW5zOiBbXSxcclxuICB2YWxpZGF0ZTogbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgfSkudmFsaWRhdG9yKCksXHJcbiAgYXN5bmMgcnVuKHsgX2lkIH0pIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcclxuICAgICAgICAnTm90IGF1dGhvcml6ZWQnLFxyXG4gICAgICAgICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gZGVsZXRlIHRlYWNoZXJzLidcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBUZWFjaGVycy5yZW1vdmVBc3luYyh7IF9pZCB9KTtcclxuICAgICAgcmV0dXJuIHsgbWVzc2FnZTogJ+GeguGfkuGemuGevOGelOGetuGek+Gem+Geu+GelOGeiuGfhOGemeGeh+GfhOGeguGeh+GfkOGemSEnIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFxyXG4gICAgICAgICdEYXRhYmFzZSBFcnJvcicsXHJcbiAgICAgICAgYEZhaWxlZCB0byBkZWxldGUgdGVhY2hlcjogJHtlcnJvci5tZXNzYWdlfWBcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9LFxyXG59KTtcclxuXHJcbi8vIFVwZGF0ZSBUZWFjaGVyIE1ldGhvZFxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICBuYW1lOiAndXBkYXRlVGVhY2hlcnMnLFxyXG4gIG1peGluczogW10sXHJcbiAgdmFsaWRhdGU6IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgZmlyc3RfbmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGxhc3RfbmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICAgIGVtYWlsOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgcGhvbmU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgICBzdWJqZWN0OiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gICAgLy8gUmVtb3ZlZCBjb3Vyc2VzX3RhdWdodCBmcm9tIHRoZSBzY2hlbWFcclxuICB9KS52YWxpZGF0b3IoKSxcclxuICBhc3luYyBydW4odGVhY2hlckRhdGEpIHtcclxuICAgIGlmICghdGhpcy51c2VySWQpIHtcclxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcclxuICAgICAgICAnTm90IGF1dGhvcml6ZWQnLFxyXG4gICAgICAgICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gdXBkYXRlIHRlYWNoZXJzLidcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHsgX2lkLCAuLi51cGRhdGVEYXRhIH0gPSB0ZWFjaGVyRGF0YTtcclxuICAgICAgcmV0dXJuIGF3YWl0IFRlYWNoZXJzLnVwZGF0ZUFzeW5jKHsgX2lkIH0sIHsgJHNldDogdXBkYXRlRGF0YSB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXHJcbiAgICAgICAgJ0RhdGFiYXNlIEVycm9yJyxcclxuICAgICAgICBgRmFpbGVkIHRvIHVwZGF0ZSB0ZWFjaGVyOiAke2Vycm9yLm1lc3NhZ2V9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH0sXHJcbn0pO1xyXG4iLCJpbXBvcnQgXCIuL0F1dGgvcHJvamVjdHNcIjtcclxuaW1wb3J0IFwiLi9zdHVkZW50c1wiO1xyXG5pbXBvcnQgXCIuL2NvdXJzZXNcIjtcclxuaW1wb3J0IFwiLi90ZWFjaGVyc1wiO1xyXG5pbXBvcnQgXCIuL2Vucm9sbG1lbnRcIjsiLCJpbXBvcnQgXCIuLi9pbXBvcnRzL2FwaVwiO1xyXG4iXX0=
