import axios from 'axios';

// Create an instance of Axios
// Uses relative /api path — Vite dev server proxies this to http://localhost:4000
const API = axios.create({
    baseURL: '/api',
});

// This piece of code automatically runs before every API request we make
API.interceptors.request.use((req) => {
    // Check if the user is logged in (has a token in their browser storage)
    const token = localStorage.getItem('token');
    
    if (token) {
        // If they have a token, attach it to the headers exactly like your backend expects:
        // verifyToken middleware expects: req.headers.authorization = "Bearer <token>"
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
