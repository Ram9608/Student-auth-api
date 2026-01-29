import { Link } from 'react-router-dom';
import { Shield, Zap, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '5vh', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ marginBottom: '2rem', position: 'relative', display: 'inline-block' }}
            >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', background: 'var(--primary)', opacity: 0.2, filter: 'blur(40px)', borderRadius: '50%' }}></div>
                <Shield size={100} color="#fff" style={{ position: 'relative' }} />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ fontSize: '4.5rem', letterSpacing: '-2px', marginBottom: '1.5rem' }}
            >
                Authentication <br />
                <span style={{ color: 'var(--primary)' }}>Reimagined.</span>
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', color: 'var(--text-secondary)' }}
            >
                A powerful, secure, and beautiful authentication system built with FastAPI and React.
                Experience the next generation of student portals.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '5rem' }}
            >
                <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                    Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                    Sign In
                </Link>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <FeatureCard icon={<Shield size={32} color="var(--primary)" />} title="Secure by Design" desc="Industry standard JWT authentication with bcrypt password hashing keeps your data safe." />
                <FeatureCard icon={<Zap size={32} color="var(--accent)" />} title="Blazing Fast" desc="Powered by FastAPI asynchronous architecture for instant response times." />
                <FeatureCard icon={<Layout size={32} color="var(--secondary)" />} title="Beautiful UI" desc="A stunning glassmorphism interface that feels premium and responsive." />
            </div>

        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel"
    >
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </motion.div>
);

export default Home;
