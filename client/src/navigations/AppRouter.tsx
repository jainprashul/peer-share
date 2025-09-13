import Layout from './Layout'
import { Route, Routes , unstable_HistoryRouter as UNSAFE_HistoryRouter} from 'react-router'
import Home from '../pages/home'
import Group from '../pages/group'  
import Call from '../pages/call'
import Fallback from '../components/Fallback'
import { history } from './history'
import { useEffect } from 'react'
import { appService } from '../services/AppService'

const AppRouter = () => {
    useEffect(() => {
        // Initialize the app service when component mounts
        appService.initialize().catch(console.error);
    }, []);
    return (
        <Layout>
            <UNSAFE_HistoryRouter history={history}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/group" element={<Group />} />
                    <Route path="/group/:groupId" element={<Group />} />
                    <Route path="/call" element={<Call />} />
                    <Route path="*" element={<Fallback />} />
                </Routes>
            </UNSAFE_HistoryRouter>
        </Layout>
    )
}

export default AppRouter