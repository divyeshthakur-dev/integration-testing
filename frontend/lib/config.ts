// Central API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://integration-testing-yjx4.onrender.com' 
    : 'http://localhost:5000');

export default API_BASE_URL;
