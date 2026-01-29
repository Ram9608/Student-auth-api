import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';

export const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar" style={{
            position: 'sticky', top: 0, zIndex: 100, padding: '1rem 0',
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--card-border)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield className="text-primary" size={28} style={{ color: 'var(--primary)' }} />
                    Auth<span style={{ color: 'var(--primary)' }}>Core</span>
                </Link>

                <div>
                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    ) : (
                        location.pathname !== '/login' && location.pathname !== '/register' && (
                            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                Log In
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};
