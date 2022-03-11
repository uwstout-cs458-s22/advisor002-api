const log = require('loglevel');
const { db } = require('../services/database');
const env = require('../services/environment');
const Course = require('./Course');

beforeAll(() => {
    log.disableAll();
});

jest.mock('../services/database.js', () => {
    return {
      db: {
        query: jest.fn(),
      },
    };
});
  
jest.mock('../services/environment.js', () => {
    return {
      masterAdminEmail: 'master@gmail.com',
    };
});

function createCourseData(name) {
    const data = ({
            email: `blank@gmail.com`,
            courseName: `${name}`,
            major: `CS`,
            credits: `4`,
            semester: `SPR`,
        });
    return data;
}

describe('Course Model', () => {
    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    describe('querying a single course by name, major, credits, and semester', () => {
        test('confirm calls to query', async () => {
            const fakeCourse = createCourseData('101');
            db.query.mockResolvedValue({rows: [fakeCourse]});
            await Course.findOneCourse(fakeCourse);
            expect(db.query.mock.calls).toHaveLength(1);
        });

        test('should return a single course', async ()=> {
            const fakeCourse = createCourseData('101');
            db.query.mockResolvedValue({rows: [fakeCourse]});
            const returnedCourse = await Course.findOneCourse(fakeCourse);
            expect(Object.keys(returnedCourse)).toEqual(Object.keys(fakeCourse));
        });

        test('should return empty for unfound course', async () => {
            db.query.mockResolvedValue({});
            const fakeCourse = createCourseData('fake');
            const unfoundCourse = await Course.findOneCourse(fakeCourse);
            expect(Object.keys(unfoundCourse)).toHaveLength(0);
        });
    });

    describe('Creating a Course', () => {
        
        test('Create course without admin permissions', async () => {
            const fakeCourse = createCourseData('fake');
            db.query.mockResolvedValue({rows: [fakeCourse]});
            await expect(Course.createCourse(fakeCourse.email, fakeCourse.courseName, fakeCourse.major, fakeCourse.credits, fakeCourse.semester))
            .rejects.toThrowError('requester does not have permissions to create a course'); 
        });
        
        test('Create course where course already exists in table', async () => {

        });

        test('Create course where no response is recieved', async () => {

        });
        
        test('Create course where all parameters are not provided', async () => {

        });

        test('Create course successfully', async () => {

        });

    });


});