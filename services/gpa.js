const gradeSystem = {
    97: 'A+',
    93: 'A',
    89: 'A-',
    85: 'B+',
    81: 'B',
    77: 'B-',
    73: 'C+',
    69: 'C',
    65: 'C-',
    60: 'D',
    0: 'F'
};

const gpaSystem = {
    'A+': 4.0,
    'A': 3.7,
    'A-': 3.3,
    'B+': 3.0,
    'B': 2.7,
    'B-': 2.3,
    'C+': 2.0,
    'C': 1.7,
    'C-': 1.3,
    'D': 1.0,
    'F': 0.0
};

module.exports = {
    getCourseGPA: (studentMark) => {
        // marks = [97, 93, 89, ...]
        const marks = Object.keys(gradeSystem).map(Number).sort((a, b) => b - a);
        for (const mark of marks) {
            if (studentMark >= mark) {
                const grade = gradeSystem[mark]; // ex: A+
                return gpaSystem[grade]; // ex: 4.0
            }
        }
        return gpaSystem['F'];
    }
};
