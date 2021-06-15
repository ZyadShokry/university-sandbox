const lodash = require('lodash');
const sqlQuery = require('../config/db');
const studentService = require('../services/student');
const gpaSystem = require('../services/gpa');
const courseSystem = require('./course');

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
        const stud_id = req.params.id;
        const student = await sqlQuery(`SELECT * FROM student WHERE id = '${stud_id}'`)
        // Fetch semester courses and place it in an array
        const pre_achieved = await sqlQuery(`SELECT prerequisite.course_id, count(prerequisite.course_id) as count FROM prerequisite JOIN (SELECT course_id FROM student JOIN registration on id = student_id WHERE mark >= 60 AND id = ${stud_id})as t on pre_id = t.course_id group by prerequisite.course_id;`)
        var pre_taken = pre_achieved.map(i => i.course_id);
        var count1 = pre_achieved.map(i => i.count);
        var pre_of_courses = []
        var count2 = []
        if (pre_taken.length != 0){
            pre_of_courses = await sqlQuery(`SELECT course_id, count(course_id) as count FROM prerequisite WHERE course_id in  (${pre_taken.join()}) GROUP BY course_id;`);
            count2 = pre_of_courses.map(i => i.count);
            }
        var available_pre = []

        for(var i = 0; i < count1.length; i++){
            if(count1[i] == count2[i]){ available_pre.push(pre_taken[i])}
        }
        var no_pre = await sqlQuery(`SELECT id from course left join prerequisite ON course.id = prerequisite.course_id LEFT JOIN registration on id = registration.course_id  WHERE pre_id IS NULL and semester <= ${student[0].semester} AND (${stud_id} not in (SELECT student_id from registration WHERE course_id = course.id) OR (student_id = ${stud_id} AND mark <60))`)
        no_pre = no_pre.map(i => i.id)

        if (available_pre.length > 0){
            var available_pre = await sqlQuery(`SELECT id FROM course LEFT JOIN registration ON course.id = registration.course_id WHERE course.id IN (${available_pre.join()}) AND course.semester <=${student[0].semester} AND (${stud_id} NOT IN (SELECT student_id FROM registration WHERE course_id = id) OR (student_id = ${stud_id} AND mark < 60));`)
        }
        var available = no_pre.concat(available_pre.map(i => i.id));
        if (available.length >0){
            var available = await sqlQuery(`SELECT * FROM course WHERE id in (${available.join()})`)
        }
        return res.render('student/register',{
                activePath: 'students',
                student: student[0],
                allowedCourses: available
        });
    },

    postRegistration: async (req, res) => {
        // get student id and chosen courses
        const student_id = req.params.id;
        var registered = req.body.courses;
        // check if the user chose more than one array and add the selected courses
        if (typeof(registered) == 'object'){
            for(var i = 0; i < registered.length; i++){
                var exists = await sqlQuery(`SELECT * FROM registration WHERE student_id = ${student_id} AND course_id = ${registered[i]}`)
                if (exists.length == 0){await sqlQuery(`INSERT INTO registration (student_id, course_id) values ('${student_id}', '${registered[i]}')`);}
                else{await sqlQuery(`UPDATE registration SET mark = NULL WHERE student_id = ${student_id} AND course_id = ${registered[i]}`);}
            }
        }
        else{
            var exists = await sqlQuery(`SELECT * FROM registration WHERE student_id = ${student_id} AND course_id = ${registered}`)
            if (exists.length == 0){await sqlQuery(`INSERT INTO registration (student_id, course_id) values ('${student_id}', '${registered}')`);}
            else{await sqlQuery(`UPDATE registration SET mark = NULL WHERE student_id = ${student_id} AND course_id = ${registered}`);}
        }
        return res.redirect('/students');
    },

    getAddMarks: async (req, res) => {
        const stud_id = req["params"]["id"];
        const student = await sqlQuery(`SELECT * FROM student WHERE id = '${stud_id}'`)
        var courses = await sqlQuery(`SELECT course_id as id, course.name FROM registration JOIN course WHERE course_id = course.id AND registration.student_id = '${stud_id}' AND mark IS NULL;`)
        // let courses_id = unmarked_courses.map(i=> i.course_id);
 
        // var courses = []
        // if(unmarked_courses.length > 0){
        //     courses = await sqlQuery(`SELECT * FROM course WHERE id in (${courses_id.join()})`);
        // }
        return res.render('student/addMarks', {
            activePath: 'students',
            student: student[0],
            courses: courses
        });

    },

    postAddMarks: async (req, res) => {
        var stud_id = req["params"]["id"];
        var marks = req.body;
        for(course in marks){
            if ((!isNaN(marks[course]) && (marks[course]!= ""))){
                await sqlQuery(`UPDATE registration SET mark = ${marks[course]} WHERE student_id = '${stud_id}' AND course_id = '${course}'`);
            }
        }
        var gpa = await studentService.getTotalGPA(stud_id)
        var sem = await studentService.getSemester(stud_id)
        await sqlQuery(`UPDATE student SET gpa = ${gpa}, semester = ${sem} WHERE id = ${stud_id}`)
        return res.redirect('/students');
    },

    getViewReport: async (req, res) => {
        const stud_id = req.params.id;
        const student = await sqlQuery(`SELECT * FROM student WHERE id = '${stud_id}'`)
        const reg_courses = await sqlQuery(`SELECT course_id, mark, name, semester FROM registration JOIN course WHERE course_id = course.id AND
        registration.student_id ='${stud_id}';`)
        const destinct_semester = await sqlQuery(`SELECT semester FROM student WHERE id ='${stud_id}';`)
        
        var groupedCourses = [];
        for (var k =0; k< destinct_semester[0]['semester']; k++ ){
            var sem = k+1
            var semester_courses = await sqlQuery(`SELECT course_id as id, mark, name FROM registration JOIN course WHERE course_id = course.id AND
                registration.student_id ='${stud_id}' AND semester = '${sem}';`)
            groupedCourses[sem] = []
            // console.log(groupedCourses)
            for (var i = 0; i < semester_courses.length; i ++){
                groupedCourses[sem].push(semester_courses[i]);
            }
   
        }
        return res.render('student/report',{
            activePath: 'students',
            student: student[0],
            groupedCourses: groupedCourses
    });
    

    },

    getRemoveStudent: async (req, res) => {

        const stud_id = req.params.id;
        await sqlQuery(`DELETE FROM registration WHERE student_id = ${stud_id}`);
        await sqlQuery(`DELETE FROM student WHERE id = ${stud_id}`);
        const result = await sqlQuery('SELECT * FROM student');
        return res.render('student/list', {
            activePath: '/students',
            students: result
        });

    }
};
