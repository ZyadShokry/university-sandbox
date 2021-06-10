const sqlQuery = require('../config/db');

module.exports = {
    getCourses: async (req, res) => {
        const result = await sqlQuery('SELECT p.id, p.name as "name", p.semester,GROUP_CONCAT( c.name SEPARATOR \', \') as "prerequisites" from (SELECT * from course left join prerequisite on course.id = prerequisite.course_id) p left join course c on p.pre_id = c.id group by p.id;')
        console.log(result);
        return res.render('course/list', {
            activePath: '/courses',
            courses: result
        });
    }
};
