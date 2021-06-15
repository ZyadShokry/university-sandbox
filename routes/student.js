const express = require('express');
const studentController = require('../controllers/student');

const router = express.Router();

// Display list of students
router.get('/', studentController.getStudents);
router.get('/students', studentController.getStudents);


// Add new student
    // Display form
router.get('/students/new', studentController.getNewStudent);
    // Save
router.post('/students', studentController.postNewStudent);


// Register courses per student
    // Display form
router.get('/students/:id/register', studentController.getRegistration);
    // Save
router.post('/students/:id/register', studentController.postRegistration);

//// Drop courses
    // Display foorm
router.get('/students/:id/drop', studentController.getDrop);
    // Save
router.post('/students/:id/drop', studentController.postDrop);


// Add marks per student
    // Display form
router.get('/students/:id/addMarks', studentController.getAddMarks);
    // Save
router.post('/students/:id/addMarks', studentController.postAddMarks);


// Display report
router.get('/students/:id/report', studentController.getViewReport);
// Remove student
router.get('/students/:id/remove', studentController.getRemoveStudent);

module.exports = router;
