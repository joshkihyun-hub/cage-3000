'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen relative overflow-hidden">

            {/* Director Info - Bottom Right */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.4, delay: 0.8, ease: [0.19, 1, 0.22, 1] }}
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    textAlign: 'right',
                    zIndex: 20,
                }}
            >
                <div style={{ width: '48px', height: '1px', backgroundColor: '#d4d4d8', marginLeft: 'auto', marginBottom: '12px' }}></div>
                <p style={{ fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic', color: '#52525b' }}>
                    Director Kihyun Kim
                </p>
                <a
                    href="https://instagram.com/cage3k"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#d4d4d8',
                        textDecoration: 'none',
                        marginTop: '4px',
                        transition: 'color 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#000'}
                    onMouseLeave={(e) => e.target.style.color = '#d4d4d8'}
                >
                    @cage3k
                </a>
            </motion.div>

        </div>
    );
}
