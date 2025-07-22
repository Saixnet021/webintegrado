// Servicio de autenticación con roles
export const ROLES = {
  ADMIN: 'admin',
  MESERO: 'mesero'
};

// Usuarios predefinidos con roles
const USERS_DB = [
  { 
    id: 1, 
    email: "admin@puntomarisco.com", 
    password: "admin123", 
    role: ROLES.ADMIN, 
    name: "Administrador",
    permissions: ['all']
  },
  { 
    id: 2, 
    email: "gerente@puntomarisco.com", 
    password: "gerente123", 
    role: ROLES.ADMIN, 
    name: "Gerente",
    permissions: ['all']
  },
  { 
    id: 3, 
    email: "mesero1@puntomarisco.com", 
    password: "mesero123", 
    role: ROLES.MESERO, 
    name: "Mesero Juan",
    permissions: ['view_menu', 'create_order', 'view_orders', 'update_order_status']
  },
  { 
    id: 4, 
    email: "mesero2@puntomarisco.com", 
    password: "mesero123", 
    role: ROLES.MESERO, 
    name: "Mesero María",
    permissions: ['view_menu', 'create_order', 'view_orders', 'update_order_status']
  }
];

// Obtener usuarios desde localStorage o usar datos por defecto
const getUsersFromStorage = () => {
  const stored = localStorage.getItem('users_db');
  return stored ? JSON.parse(stored) : USERS_DB;
};

// Guardar usuarios en localStorage
const saveUsersToStorage = (users) => {
  localStorage.setItem('users_db', JSON.stringify(users));
};

// Autenticar usuario
export const authenticateUser = (email, password) => {
  const users = getUsersFromStorage();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const userSession = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    localStorage.setItem('isAuthenticated', 'true');
    return { success: true, user: userSession };
  }
  
  return { success: false, message: 'Credenciales incorrectas' };
};

// Obtener usuario actual
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Verificar si el usuario tiene un rol específico
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Verificar si el usuario tiene un permiso específico
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && (user.permissions.includes('all') || user.permissions.includes(permission));
};

// Verificar si es admin
export const isAdmin = () => hasRole(ROLES.ADMIN);

// Verificar si es mesero
export const isMesero = () => hasRole(ROLES.MESERO);

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = () => {
  if (!isAdmin()) {
    throw new Error('No tienes permisos para ver usuarios');
  }
  return getUsersFromStorage();
};

// Crear nuevo usuario (solo admin)
export const createUser = (userData) => {
  if (!isAdmin()) {
    throw new Error('No tienes permisos para crear usuarios');
  }
  
  const users = getUsersFromStorage();
  const existingUser = users.find(u => u.email === userData.email);
  
  if (existingUser) {
    throw new Error('Ya existe un usuario con ese email');
  }
  
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    ...userData,
    permissions: userData.role === ROLES.ADMIN ? ['all'] : ['view_menu', 'create_order', 'view_orders', 'update_order_status']
  };
  
  users.push(newUser);
  saveUsersToStorage(users);
  return newUser;
};

// Actualizar usuario (solo admin)
export const updateUser = (userId, userData) => {
  if (!isAdmin()) {
    throw new Error('No tienes permisos para actualizar usuarios');
  }
  
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Usuario no encontrado');
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...userData,
    permissions: userData.role === ROLES.ADMIN ? ['all'] : ['view_menu', 'create_order', 'view_orders', 'update_order_status']
  };
  
  saveUsersToStorage(users);
  return users[userIndex];
};

// Eliminar usuario (solo admin)
export const deleteUser = (userId) => {
  if (!isAdmin()) {
    throw new Error('No tienes permisos para eliminar usuarios');
  }
  
  const users = getUsersFromStorage();
  const filteredUsers = users.filter(u => u.id !== userId);
  
  if (filteredUsers.length === users.length) {
    throw new Error('Usuario no encontrado');
  }
  
  saveUsersToStorage(filteredUsers);
  return true;
};
