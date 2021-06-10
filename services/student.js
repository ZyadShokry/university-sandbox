const sqlQuery = require('../config/db');
const gpaSystem = require('./gpa');

module.exports = {
    getSemester: async (studentId) => {
        const result = await sqlQuery(`SELECT COUNT(*) as total FROM registration
            WHERE student_id = ${studentId} AND mark >= 60`);
        const totalFinishedCourses = result[0].total;
        return Math.min(8, Math.floor((totalFinishedCourses) / 4 + 1));
    },

    getTotalGPA: async (studentId) => {
        // result = [ { mark: 50 }, { mark: 70 }, .. ]
        const result = await sqlQuery(`SELECT mark FROM registration
            WHERE student_id = ${studentId} AND mark IS NOT NULL`);
        let gpaSum = 0
        for (const item of result) {
            gpaSum += gpaSystem.getCourseGPA(+item.mark);
        }
        return (!!result.length) ? +((gpaSum / result.length).toFixed(2)) : null;
    }
};
