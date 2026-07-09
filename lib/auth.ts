// Save token and user info after login
export const saveAuth = (token: string, user: any) => {
  localStorage.setItem('kstu_token', token);
  localStorage.setItem('kstu_user', JSON.stringify(user));
};

// Get token
export const getToken = (): string | null => {
  return localStorage.getItem('kstu_token');
};

// Get user info
export const getUser = (): any => {
  const user = localStorage.getItem('kstu_user');
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('kstu_token');
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};

// Logout
export const logout = () => {
  localStorage.removeItem('kstu_token');
  localStorage.removeItem('kstu_user');
};