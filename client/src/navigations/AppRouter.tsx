import Layout from './Layout'
import { BrowserRouter, Route, Routes } from 'react-router'
import Home from '../pages/home'
import Group from '../pages/group'
import Call from '../pages/call'
import Fallback from '../components/Fallback'

const AppRouter = () => {
    return (
        <Layout>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/group" element={<Group />} />
                    <Route path="/call" element={<Call />} />
                    <Route path="*" element={<Fallback />} />
                </Routes>
            </BrowserRouter>
        </Layout>
    )
}

export default AppRouter