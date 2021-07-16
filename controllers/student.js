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
        await sqlQuery(`INSERT INTO student (name,gpa) values ('${name}',null)`);
        return res.redirect('/students');
    },

    getRegistration: async (req, res) => {
        const studentId =+req.params.id;
        const reg = await sqlQuery(`SELECT * FROM student where id =${studentId}`);
        // courses that have semester number less than that of student, and not passed and not currently registered
        const allowed = await sqlQuery(`SELECT course.id, course.name FROM student
         JOIN course ON (student.semester >=course.semester) 
             WHERE student.id = ${studentId}
              AND course.id NOT IN (SELECT course_id FROM registration 
                WHERE registration.student_id = student.id AND (registration.mark >= 60 OR registration.mark IS NULL))`);
        var candp = [];
        for (var cname = 0; cname<allowed.length;cname++){
            //pre of courses and push it in a list
            const prereq = await sqlQuery(`SELECT GROUP_CONCAT( c.id SEPARATOR \', \') as "batikha" FROM 
            (SELECT * FROM course 
            LEFT JOIN prerequisite on course.id = prerequisite.course_id)p 
            LEFT JOIN course c ON p.pre_id = c.id WHERE p.id = ${allowed[cname].id} GROUP BY p.id`)
            candp.push({'courseid' : allowed[cname].id , 'preName':prereq[0].batikha});   
            };

        available = []
        // make sure prerequisites are fulfilled 
        for (var availcrs = 0; availcrs<candp.length; availcrs++){
            var add = true;
            if (candp[availcrs].preName !== null){
                pre = candp[availcrs].preName.split(",");
                // check if he fails in a pre or didn't take it before
                for(var i = 0; i < pre.length; i++){
                    const mark = await sqlQuery(`SELECT registration.mark 
                    FROM course JOIN registration ON registration.course_id
                    = course.id WHERE course.id =${pre[i]}
                    AND registration.student_id = ${studentId} AND mark >= 60`);
                    if(mark.length == 0){add = false}
                }
            
            }
            if(add){
                available.push(candp[availcrs].courseid.toString())
            }
        }
        // show only available courses
        if(available.length > 0){
            available = await sqlQuery(`SELECT * FROM course WHERE id IN (${available.join()})`)
        }

        return res.render('student/register', {
            activePath: '/students/:id/register',
            student: reg[0],
            allowedCourses: available
        });
    },

    postRegistration: async (req, res) => {
        const studentId =+req.params.id;
        var courseId = req.body.courses;
        // if he registered only one course, place it in a list
        if(typeof courseId == "string"){courseId = [courseId]}
        for (var i=0; i < courseId.length; i++){
            //if he fails it updates the mark to null if not he inserts a new entry to table registration
            const registered = await sqlQuery(`SELECT * FROM registration WHERE student_id = ${studentId} AND course_id = ${courseId[i]}`)
            if(registered.length == 0){await sqlQuery(`INSERT INTO Registration (student_id,course_id,mark) values (${studentId},${courseId[i]},null)`);}
            else{await sqlQuery(`UPDATE registration SET mark = NULL WHERE student_id = ${studentId} AND course_id = ${courseId[i]}`)}
        };
        return res.redirect('/students');
    },

    getAddMarks: async (req, res) => {
        const stud_id = req.params.id;
        const semester = await sqlQuery(`SELECT * from course INNER JOIN registration ON course.id=registration.course_id where student_id=('${stud_id}');`);
        const student = await sqlQuery(`SELECT * from student where id=('${stud_id}');`);
        var courses   = [];
        for (row in semester){
            if(semester[row].mark === null ){
                courses.push({'id' : semester[row].course_id , 'name': semester[row].name });
            }
        }

        // console.log(courses);

        return res.render('student/addMarks', {
            activePath: '/students/:id/addMarks',
            student: student[0],
            courses : courses
        });
    },

    postAddMarks: async (req, res) => {
        const s_Id = req.params.id;
        // const c_Id = req.body;
        // const mark = req.body;
        const obj = JSON.parse(JSON.stringify(req.body));
        var keys = Object.keys(obj);
        
        for (var i = 0; i < keys.length; i++) {
            const mark = obj[keys[i]];
            if (mark !== null){ 
                    await sqlQuery(` UPDATE registration set mark=${mark} where student_id =  ${s_Id} and course_id = ${keys[i]};`);
        }   
        }
        const stgpa = await studentService.getTotalGPA(s_Id);
        const stsem = await studentService.getSemester(s_Id);
        await sqlQuery(`UPDATE student set gpa = ${stgpa}, semester = ${stsem} WHERE id = ${s_Id}`);
        return res.redirect('/students');

    },


    getViewReport: async (req, res) => {
        const stud_id = req.params.id;
        const semester = await sqlQuery(`SELECT * from course INNER JOIN registration ON course.id=registration.course_id where student_id=('${stud_id}');`);
        const student = await sqlQuery(`SELECT * from student where id=('${stud_id}');`);
        var groupedCourses   = {};
        for (row in semester){
            if(groupedCourses[semester[row].semester] === undefined ){
                groupedCourses[semester[row].semester] = [];
                groupedCourses[semester[row].semester].push({'id' : semester[row].course_id , 'name': semester[row].name , 'mark': semester[row].mark});
            } 
            else {
            groupedCourses[semester[row].semester].push({'id' : semester[row].course_id , 'name': semester[row].name , 'mark': semester[row].mark});
            }
        }
        return res.render('student/report',{activePath: '/students',
        groupedCourses: groupedCourses, student: student[0]});
    },

    getdeleteStudent: async (req, res) => {
        return res.render('student/delete', {
            activePath: '/students/delete'
        });
    },

    postdeleteStudent: async (req, res) => {
        const id = req.body.id;
        await sqlQuery(`delete from registration where student_id = ${id}`);
        await sqlQuery(`delete from student where id = ${id}`);
        return res.redirect('/students');
    },
};
