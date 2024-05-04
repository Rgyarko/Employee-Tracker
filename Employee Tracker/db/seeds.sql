USE employee_tracker;

INSERT INTO department (name) VALUES ('Sales'), ('Engineering');

INSERT INTO role (title, salary, department_id) VALUES ('Sales Lead', 100000, 1), ('Software Engineer', 120000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL), ('Jane', 'Smith', 2, 1);
