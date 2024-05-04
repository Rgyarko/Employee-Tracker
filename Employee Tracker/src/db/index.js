const mysql = require("mysql2");
const inquirer = require("inquirer");

// Create connection
const connection = mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: "qqqq",
    database: "employee_tracker",
  })
  .promise();

async function viewAllDepartments() {
  try {
    const [rows] = await connection.query("SELECT * FROM department");
    console.table(rows);
  } catch (err) {
    console.error("Error viewing departments:", err.message);
  }
  mainMenu();
}

async function viewAllRoles() {
  try {
    const [rows] = await connection.query(`
            SELECT role.id, role.title, department.name AS department, role.salary
            FROM role
            INNER JOIN department ON role.department_id = department.id
        `);
    console.table(rows);
  } catch (err) {
    console.error("Error viewing roles:", err.message);
  }
  mainMenu();
}

async function viewAllEmployees() {
  try {
    const [rows] = await connection.query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
        `);
    console.table(rows);
  } catch (err) {
    console.error("Error viewing employees:", err.message);
  }
  mainMenu();
}

async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    name: "departmentName",
    type: "input",
    message: "What is the name of the department?",
  });

  try {
    await connection.query("INSERT INTO department (name) VALUES (?)", [
      departmentName,
    ]);
    console.log(`Added ${departmentName} to the database`);
  } catch (err) {
    console.error("Error adding department:", err.message);
  }
  mainMenu();
}

async function addRole() {
  const departments = await connection.query("SELECT id, name FROM department");
  const departmentChoices = departments[0].map(({ id, name }) => ({
    name: name,
    value: id,
  }));

  const { title, salary, departmentId } = await inquirer.prompt([
    {
      name: "title",
      type: "input",
      message: "What is the title of the role?",
    },
    {
      name: "salary",
      type: "input",
      message: "What is the salary of the role?",
    },
    {
      name: "departmentId",
      type: "list",
      message: "Which department does the role belong to?",
      choices: departmentChoices,
    },
  ]);

  try {
    await connection.query(
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
      [title, salary, departmentId]
    );
    console.log(`Added ${title} role to the database`);
  } catch (err) {
    console.error("Error adding role:", err.message);
  }
  mainMenu();
}

async function addEmployee() {
  const roles = await connection.query("SELECT id, title FROM role");
  const roleChoices = roles[0].map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const managers = await connection.query(
    "SELECT id, first_name, last_name FROM employee"
  );
  const managerChoices = managers[0].map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      name: "firstName",
      type: "input",
      message: "What is the first name of the employee?",
    },
    {
      name: "lastName",
      type: "input",
      message: "What is the last name of the employee?",
    },
    {
      name: "roleId",
      type: "list",
      message: "What is the role of the employee?",
      choices: roleChoices,
    },
    {
      name: "managerId",
      type: "list",
      message: "Who is the manager of the employee?",
      choices: [...managerChoices, { name: "No Manager", value: null }],
    },
  ]);

  try {
    await connection.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [firstName, lastName, roleId, managerId]
    );
    console.log(`Added ${firstName} ${lastName} to the database`);
  } catch (err) {
    console.error("Error adding employee:", err.message);
  }
  mainMenu();
}

async function updateEmployeeRole() {
  const employees = await connection.query(
    "SELECT id, first_name, last_name FROM employee"
  );
  const employeeChoices = employees[0].map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const roles = await connection.query("SELECT id, title FROM role");
  const roleChoices = roles[0].map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { employeeId, roleId } = await inquirer.prompt([
    {
      name: "employeeId",
      type: "list",
      message: "Which employee's role do you want to update?",
      choices: employeeChoices,
    },
    {
      name: "roleId",
      type: "list",
      message: "What is the new role?",
      choices: roleChoices,
    },
  ]);

  try {
    await connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [
      roleId,
      employeeId,
    ]);
    console.log(`Updated employee's role in the database`);
  } catch (err) {
    console.error("Error updating employee role:", err.message);
  }
  mainMenu();
}

function mainMenu() {
  require("../../index").mainMenu();
}

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole,
};
