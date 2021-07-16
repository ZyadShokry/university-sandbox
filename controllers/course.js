const sqlQuery = require('../config/db');

module.exports = {
    getCourses: async (req, res) => {
        const re = await sqlQuery('SELECT p.id, p.name, p.semester, GROUP_CONCAT( c.name SEPARATOR \', \') as \"prerequisites\" FROM (SELECT * FROM course LEFT JOIN prerequisite on course.id = prerequisite.course_id)p LEFT JOIN course c ON p.pre_id = c.id GROUP BY p.id');
        return res.render('course/list', {
            activePath: '/courses',
            courses: re
        });
    }
};
