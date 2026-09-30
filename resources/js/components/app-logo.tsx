export default function AppLogo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center ${className}`}>
            {/* Dark mode logo */}
            <img
                src="/images/helloweb-logo-dark.png"
                alt="HelloWeb"
                className="hidden dark:block h-8 w-auto max-w-[150px] object-contain"
            />
            {/* Light mode logo */}
            <img
                src="/images/helloweb-logo-light.png"
                alt="HelloWeb"
                className="block dark:hidden h-8 w-auto max-w-[150px] object-contain"
            />
        </div>
    );
}
