import Layout from './Layout'
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import Home from '../pages/home'
import Group from '../pages/group'
import Call from '../pages/call'
import Fallback from '../components/Fallback'
import { history } from './history'
import { useEffect } from 'react'
import { onAppStart } from './onAppStart'
import LoginPage from '../pages/auth/login'
import RegisterPage from '../pages/auth/register'

const AppRouter = () => {
    useEffect(() => {
        onAppStart();
    }, []);

    return (
        <BrowserRouter>
            <Layout>
                <AppRouterContent />
            </Layout>
        </BrowserRouter>
    )
}

export default AppRouter

function AppRouterContent() {
    history.navigate = useNavigate();
    history.location = useLocation();
    history.params = useParams();
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/group" element={<Group />} />
            <Route path="/group/:groupId" element={<Group />} />
            <Route path="/call" element={<Call />} />
            <Route path="*" element={<Fallback />} />
        </Routes>
    )
}