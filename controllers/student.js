const sqlQuery = require('../config/db');

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
        var id = req["params"]["id"];
        
        // console.log(id)
        return res.render('student/')
    },

    postRegistration: async (req, res) => {
        // ..
    },

    getAddMarks: async (req, res) => {
        // ..
    },

    postAddMarks: async (req, res) => {
        // ..
    },

    getViewReport: async (req, res) => {
        // ..
    }
};
