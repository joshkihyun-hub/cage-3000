export default function PageContainer({ children, className = '' }) {
    return (
        <div className={`max-w-screen-xl mx-auto px-4 md:px-12 py-10 ${className}`}>
            {children}
        </div>
    );
}
