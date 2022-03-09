const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});



jest.mock('../models/Course.js', () => {
  return {
    findOneCourse: jest.fn(),
    // findAll: jest.fn(),
    // create: jest.fn(),
    editCourse: jest.fn()

  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3001,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com',
  };
});

jest.mock('../services/auth', () => {
  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      return next();
    }),
  };
});


// a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: `course${value}`,
      courseId: `courseTestId${value}`,
      major: 'compSci',
      credits: `${value}`,
      semester: 'summer',
    });
  }
  return data;
}



// describe('GET /courses', () => {
//   beforeEach(() => {
//     // User.create.mockReset();
//     // User.create.mockResolvedValue(null);
//     Course.findOneCourse.mockReset();
//     Course.findOneCourse.mockResolvedValue(null);
//     // User.findAll.mockReset();
//     // User.findAll.mockResolvedValue(null);
//   });


//   // helper functions - id is a numeric value
//   async function callGetOnCourseRoute(row, key = 'id') {
//     const id = row[key];
//     Course.findOneCourse.mockResolvedValueOnce(row);
//     const response = await request(app).get(`/users/${id}`);
//     return response;
//   }
//   // helper functions - userId is a text value

// });


describe('PUT /courses', () => {
  beforeEach(() => {
    Course.findOneCourse.mockReset();
    Course.findOneCourse.mockResolvedValue(null);
    Course.editCourse.mockReset();
    Course.editCourse.mockResolvedValue(null);
  });


  // Skipping all tests for create, find, etc.



  describe('Given id', () => {
    test('Testing calling Course.findOneCourse and Course.editCourse', async () => {
      const data = dataForGetCourse(3);
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const requestor = {
          // id: 123,
          // name: `courseTest`,
          // courseId: `courseTestId`,
          // major: 'Computer Science',
          // credits: 1,
          // semester: 'Spring'
          id: 123,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId'
        }
        const requestParams = {
          // id: row.id,
          name: "newClass"
        };
        const updatedCourse = {
          id: row.id,
          name: requestParams.name,
          courseId: row.courseId,
          major: row.major,
          credits: row.credits,
          semester: row.semester
        };

        // findOneCourse.mockResolvedValueOnce(row) is basically pretending to call findonecourse and having it return row
        // So for this first one, we should only need the first mock because in our function in routes (.put)
        // we are asking for a course, which will have the values in row,
        // We dont need requestor as that is a user and we don't require the user stats (unless we want ot check validation later)
        // We should to ^ for all of the following ones as well and edit them (like the JSON one)
        // to test our tests we must to 'npm test'
        Course.findOneCourse.mockResolvedValueOnce(row)
        Course.editCourse.mockResolvedValueOnce(updatedCourse);
        await request(app).put(`/courses/${row.id}`).send(requestParams);
        // const result = await request(app).put(`/courses/${row.id}`).send(requestParams);
        // expect(result).toStrictEqual(updatedCourse)
        expect(Course.editCourse.mock.calls[i]).toStrictEqual(updatedCourse);


        // expect(Course.findOneCourse.mock.calls).toHaveLength((i + 1) * 2);
        // expect(Course.findOneCourse.mock.calls[i]).toHaveLength(1);
        // expect([row.id, requestor.id]).toContain(Course.findOneCourse.mock.calls[i + 1][0].id);
        // expect(Course.editCourse.mock.calls).toHaveLength(i + 1); // Original
        // expect(Course.editCourse.mock.calls[i]).toHaveLength(2);
        // expect(Course.editCourse.mock.calls[i][0]).toBe(row.id);
        // expect(Course.editCourse.mock.calls[i][1]).toStrictEqual(requestParams);

        // expect(Course.findOneCourse.mock.calls).toHaveLength(i + 1); //Our idea (probs not right)
        // expect(Course.findOneCourse.mock.calls[i]).toHaveLength(2);
        // expect(Course.findOneCourse.mock.calls[i][0]).toBe(row.id);
        // expect(Course.findOneCourse.mock.calls[i][1]).toStrictEqual(requestParams);

        // expect(Course.findOneCourse)
      }
    });

    test('Return course ID in JSON', async () => {
      // const data = dataForGetCourse(10);
      const data = dataForGetCourse(1);
      for (const row of data) {
        const requestor = {
          id: 123,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId'
        }
        const requestParams = {
          // senderId: requestor.id,
          // role: 'director'
          id: 2
        };
        const updatedCourse = {
          id: requestParams.id,
          name: row.name,
          courseId: row.courseId,
          major: row.major,
          credits: row.credits,
          semester: row.semester
        };

        Course.findOneCourse.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
        Course.editCourse.mockResolvedValueOnce(updatedCourse);

        const {
          body: course
        } = await request(app).put(`/courses/${row.id}`).send(updatedCourse);
        expect(course.id).toBe(updatedCourse.id);
        expect(course.name).toBe(row.name);
        expect(course.courseId).toBe(row.courseId);
        expect(course.major).toBe(row.major);
        expect(course.credits).toBe(row.credits);
        expect(course.semester).toBe(row.semester);
      }
    });

    test('Throw 500 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const requestParams = {
        role: 'director'
      };
      Course.findOneCourse.mockResolvedValueOnce({
        row: row
      });
      Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).put('/courses').send(requestParams);
      expect(response.statusCode).toBe(500);
    });

    test('Throw 404 error', async () => {
      const requestParams = {
        role: 'director'
      };
      Course.findOneCourse.mockResolvedValueOnce({});
      Course.editCourse.mockRejectedValueOnce(new Error('No course present'));
      const response = await request(app).put('/courses').send(requestParams);
      expect(response.statusCode).toBe(404);
    });

    test('Throw 400 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      Course.findOneCourse.mockResolvedValueOnce({
        row: row
      });
      // Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
      // const response = await request(app).put('/courses').send({
      //  major: 'computerScience'
      // });
      const response = await request(app).put(`/courses/${row.id}`).send({

      })

      expect(response.statusCode).toBe(400);
    });

    test('Throw 403 error', async () => {
      // const data = dataForGetCourse(1);
      // const row = data[0];
      // const requestor = {
      //   id: 123,
      //   email: 'fake@aol.com',
      //   role: 'director',
      //   enable: true,
      //   userId: 'userId'
      // }
      // const requestParams = {
      //   senderId: requestor.id,
      //   role: 'director',
      //   id: row.id
      // };

      Course.findOneCourse.mockResolvedValueOnce({
        id: 123,
        courseID: 'TestClass123',
        name: 'TestClass',
        major: 'CompSci',
        credits: 3,
        semester: 'fall'
      }).mockResolvedValueOnce({
        id: 456,
        courseID: 'TestClass456',
        name: 'TestClass456',
        major: 'CompSci456',
        credits: 4,
        semester: 'spring'
      })

      // Course.findOneCourse.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
      // const response = await request(app).put(`/courses/${row.id}`).send(requestParams);
      const response = await request(app).put(`/courses`).send({
        id: 123,
        courseID: 'TestClass456'
      });
      expect(response.statusCode).toBe(403);
    });
  });
});