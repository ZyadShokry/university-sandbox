CREATE DATABASE university;
USE university;

CREATE TABLE student
(
    id       int         not null auto_increment,
    name     varchar(30) not null,
    gpa      float default null,
    semester int   default 1,
    primary key (id)
);

CREATE TABLE course
(
    id       int         not null auto_increment primary key,
    name     varchar(30) not null,
    semester int         not null
);

CREATE TABLE prerequisite
(
    course_id int,
    pre_id    int,
    primary key (course_id, pre_id),
    foreign key (course_id) references course (id),
    foreign key (pre_id) references course (id)
);

INSERT INTO student (name)
VALUES ('Hoorain Lowry'),
       ('Gregor Riggs'),
       ('Hunter Doherty'),
       ('Sylvie Stevens'),
       ('Edmund Mayer'),
       ('Tom Bull'),
       ('Tanner Field'),
       ('Eduardo Pratt'),
       ('Harlen Mccall'),
       ('Romany Jack');

INSERT INTO course (name, semester)
VALUES ("Math I", 1),
       ("Mechanics I", 1),
       ("Physics I", 1),
       ("Drawing I", 1),
       ("Chemistry", 1),
       ("Math II", 2),
       ("Mechanics II", 2),
       ("Physics II", 2),
       ("Drawing II", 2),
       ("Programming I", 2),
       ("Programming II", 3),
       ("Probability and Statistics", 3),
       ("Discrete Mathematics", 3),
       ("Circuits I", 3),
       ("Data Structures I", 3),
       ("Digital Logic", 4),
       ("Circuits II", 4),
       ("Linear Algebra", 4),
       ("Signals and Systems", 4),
       ("Data Structures II", 4),
       ("Computer Architecture", 5),
       ("Operating Systems", 5),
       ("Algorithms", 5),
       ("Embedded Systems", 5),
       ("Artificial Intelligence", 6),
       ("Database Systems", 6),
       ("Computer Networks", 6),
       ("Computer Graphics", 6),
       ("Machine Learning", 7),
       ("Network Security", 7),
       ("Numerical Analysis", 7),
       ("Graduation Project I", 7),
       ("Computer Vision", 8),
       ("Optimization Techniques", 8),
       ("Distributed Systems", 8),
       ("Graduation Project II", 8);

INSERT INTO prerequisite (course_id, pre_id)
VALUES (6, 1),
       (8, 3),
       (7, 2),
       (9, 4),
       (11, 10),
       (12, 6),
       (14, 8),
       (17, 14),
       (18, 6),
       (20, 15),
       (23, 20),
       (24, 17),
       (24, 16),
       (25, 18),
       (29, 25),
       (30, 27),
       (31, 6),
       (34, 18),
       (33, 29),
       (35, 22),
       (36, 32);

CREATE TABLE registration
(
    student_id int           not null,
    course_id  int           not null,
    mark       decimal(6, 2) null,
    primary key (student_id, course_id),
    foreign key (student_id) references student (id),
    foreign key (course_id) references course (id)
);