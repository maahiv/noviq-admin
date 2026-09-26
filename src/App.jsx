import {BrowserRouter,Navigate,Routes,Route} from 'react-router-dom';
import {AdminAuthProvider} from './context/AdminAuthContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
export default function App(){return <BrowserRouter><AdminAuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/" element={<ProtectedAdminRoute><AdminLayout/></ProtectedAdminRoute>}><Route index element={<Products/>}/><Route path="dashboard" element={<Dashboard/>}/><Route path="products" element={<Products/>}/><Route path="categories" element={<Categories/>}/><Route path="orders" element={<Orders/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AdminAuthProvider></BrowserRouter>}
