import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
export default function ProtectedAdminRoute({children}){const {user}=useAdminAuth();return user?.role==='admin'?children:<Navigate to="/login" replace/>}
