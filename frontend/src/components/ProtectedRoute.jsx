import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // If there's no token, redirect to login immediately
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the protected component
    return children;
};

export default ProtectedRoute;
