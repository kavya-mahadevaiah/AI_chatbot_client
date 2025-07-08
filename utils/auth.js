export const saveToken = (token) => {
  
  if (typeof window !== "undefined") {
    return sessionStorage.setItem('token', token);
  }
  return null;
};

export const getToken = () => {
  
  if (typeof window !== "undefined") {
    return sessionStorage.getItem('token');
  }
  return null;
};

export const removeToken = () => {

  if (typeof window !== "undefined") {
    return sessionStorage.removeItem('token');
  }
  return null;
};
