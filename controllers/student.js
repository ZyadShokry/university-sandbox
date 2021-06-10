const lodash = require('lodash');
const sqlQuery = require('../config/db');
const studentService = require('../services/student');

module.exports = {
    getStudents: async (req, res) => {
        const result = await sqlQuery('SELECT * FROM student');
        return res.render('student/list', {
            activePath: '/students',
            students: result
        });
    },

    getNewStudent: async (req, res) => {
        return res.render('student/new', {
            activePath: '/students'
        });
    },

    postNewStudent: async (req, res) => {
        const name = req.body.name;
        await sqlQuery(`INSERT INTO student (name) values ('${name}')`);
        return res.redirect('/students');
    },

    getRegistration: async (req, res) => {
        // Get student id and semester
        const stud_id = req["params"]["id"];
        const student = await sqlQuery(`SELECT * FROM student WHERE id = '${stud_id}'`)
        // Fetch semester courses and place it in an array
        const semester_courses = await sqlQuery(`SELECT id FROM course WHERE semester <= '${student[0]['semester']}'`)
        let courses_id = [];
        for(var i = 0; i < semester_courses.length; i++){
            courses_id.push(semester_courses[i]['id']);
        }
        // get prerequisites of available courses if any and place them in a hash, get previously taken courses and place them in an array
        const pre = await sqlQuery(`SELECT p.id, GROUP_CONCAT( c.id SEPARATOR \', \') as "prerequisites" from (SELECT * from course left join prerequisite on course.id = prerequisite.course_id) p left join course c on p.pre_id = c.id WHERE p.id in ('${courses_id.join()}') group by p.id`)
        const reg_courses = await sqlQuery(`SELECT course_id as id from registration WHERE student_id = \'${stud_id}'`);
        let taken_courses = [];
        for(var i = 0; i < reg_courses.length; i++){
            taken_courses.push(reg_courses[i]['id']);
        }

        let pre_courses = {}
        for (var i = 0; i < pre.length; i++) {
            if((pre[i]['prerequisites']) == null){continue}
            pre_courses[pre[i]['id']] = pre[i]['prerequisites'];
        }

        // iterate on the courses and make sure there is no prerequisites missing
        var j = 0;
        let course_cpy = [...courses_id];
        for(var i = 0; i < courses_id.length; i++){
            var course_pre = pre_courses[courses_id[i]]
            if (typeof(course_pre) == 'undefined'){continue;}
            if (typeof(taken_courses) == 'undefined'){
                course_cpy.splice(i - j, 1);
                j++;
                continue;
            }
            if (course_pre.includes(',')){
                course_pre = course_pre.split(',');
                for(course in course_pre){
                    if(!taken_courses.includes(course)){
                        course_cpy.splice(i - j, 1);
                        j++;
                    } 
                }
            }
            else{
                if(taken_courses.includes(course_pre)){
                    course_cpy.splice(i - j, 1);
                    j++;
                }
            }
        }

        // remove already taken courses
        var j = 0;
        var course_cpy2 = [...course_cpy];
        for(var i= 0; i < course_cpy.length; i++){
            if (typeof(taken_courses) == 'undefined'){continue;}
            if (taken_courses.includes(course_cpy[i])){
                course_cpy2.splice(i - j, 1);
                j++;
            }
        }
        // only query if there are allowed courses
        var allowed_courses = null;
        if(course_cpy2.length > 0){
            allowed_courses = await sqlQuery(`SELECT id,name FROM course WHERE id in(${course_cpy2.join()})`)
        } 
        return res.render('student/register',{
                activePath: 'students',
                student: student[0],
                allowedCourses: allowed_courses
        });
    },

    postRegistration: async (req, res) => {
        // get student id and chosen courses
        const student_id = req.params.id;
        var registered = req.body.courses;
        // check if the user chose more than one array and add the selected courses
        if (typeof(registered) == 'object'){
            for(var i = 0; i < registered.length; i++){
                await sqlQuery(`INSERT INTO registration (student_id, course_id) values ('${student_id}', '${registered[i]}')`);
            }
        }
        else{
            await sqlQuery(`INSERT INTO registration (student_id, course_id) values ('${student_id}', '${registered}')`);
        }
        return res.redirect('/students');
    },

    getAddMarks: async (req, res) => {
        const stud_id = req["params"]["id"];
        const student = await sqlQuery(`SELECT * FROM student WHERE id = '${stud_id}'`)
        const unmarked_courses = await sqlQuery(`SELECT course_id FROM registration JOIN course WHERE course_id = course.id AND registration.student_id = '${stud_id}' AND mark IS NULL;`)
        let courses_id = [];
        for(var i = 0; i < unmarked_courses.length; i++){
            courses_id.push(unmarked_courses[i]['course_id']);
        }
        var courses = []
        if(courses.length > 0){
            courses = await sqlQuery(`SELECT * FROM course WHERE id in (${courses_id.join()})`);
        }
        return res.render('student/addMarks', {
            activePath: 'students',
            student: student[0],
            courses: courses
        });

    },

    postAddMarks: async (req, res) => {
        const stud_id = req["params"]["id"];
        var marks = req.body;
        for(course in marks){
            if ((!isNaN(marks[course]) && (marks[course]!= ""))){
                console.log(marks[course]);
                await sqlQuery(`UPDATE registration SET mark = ${marks[course]} WHERE student_id = '${stud_id}' AND course_id = '${course}'`);
            }
        }
        return res.redirect('/students');
    },

    getViewReport: async (req, res) => {
        // ..
    }
};
