const USERS_KEY = "focus_users";
const SESSION_KEY = "focus_session";

// obtener usuarios
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// guardar usuarios
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// REGISTRO
if (document.getElementById("registerForm")) {

    document.getElementById("registerForm").addEventListener("submit", (e) => {
        e.preventDefault();

        let users = getUsers();

        const user = document.getElementById("regUser").value;
        const pass = document.getElementById("regPass").value;

        const exists = users.find(u => u.user === user);

        if (exists) {
            alert("Usuario ya existe");
            return;
        }

        users.push({ user, pass });

        saveUsers(users);

        alert("Usuario creado");

        window.location.href = "login.html";
    });
}

// LOGIN
if (document.getElementById("loginForm")) {

    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const user = document.getElementById("loginUser").value;
        const pass = document.getElementById("loginPass").value;

        let users = getUsers();

        const found = users.find(u => u.user === user && u.pass === pass);

        if (!found) {
            alert("Credenciales incorrectas");
            return;
        }

        localStorage.setItem(SESSION_KEY, user);

        window.location.href = "index.html";
    });
}

// CHECK SESSION (para index)
function checkSession() {
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
        window.location.href = "login.html";
    }
}

// LOGOUT (opcional)
function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}