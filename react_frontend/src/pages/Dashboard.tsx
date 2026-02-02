
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner"></div></div>;

    if (user.role === 'teacher') {
        return <TeacherDashboard />;
    }

    return <StudentDashboard />;
};

export default Dashboard;
