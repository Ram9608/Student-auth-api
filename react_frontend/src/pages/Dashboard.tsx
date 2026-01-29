import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Mail, PhoneCall } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ paddingTop: '2rem' }}>

            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Hi, {user.first_name}</h1>
                    <p>Here's an overview of your student profile.</p>
                </div>
                <span className="glass-panel" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {user.role.toUpperCase()}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel"
                        style={{ padding: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                            <h3>Profile Information</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <InfoItem label="Full Name" value={`${user.first_name} ${user.last_name}`} icon={<User size={18} />} />
                            <InfoItem label="Email Address" value={user.email} icon={<Mail size={18} />} />
                            <InfoItem label="Phone Number" value={user.phone} icon={<PhoneCall size={18} />} />
                            <InfoItem label="Member Since" value="Jan 2024" icon={<ShieldCheck size={18} />} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel"
                    >
                        <h3>Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <ActivityItem icon={<div style={{ width: 40, height: 40, background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}><ShieldCheck size={20} /></div>} title="Logged In" time="Just now" />
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.5rem' }}>100%</h4>
                            <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Security Score</span>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon }: any) => (
    <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {icon} {label}
        </label>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{value}</div>
    </div>
);

const ActivityItem = ({ icon, title, time }: any) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        {icon}
        <div>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{time}</div>
        </div>
    </div>
);

export default Dashboard;
