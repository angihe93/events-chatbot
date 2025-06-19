export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-muted min-h-screen w-full">
            {children}
        </div>
    );
}