import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="bg-primary flex size-8.5 items-center justify-center rounded-xl text-white shadow-xs transition-transform group-hover:scale-105">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-foreground flex items-center gap-1 text-sm font-bold tracking-tight">
                    HelloWeb
                    <span className="bg-primary size-1.5 rounded-full" />
                </span>
                <span className="text-muted-foreground -mt-0.5 text-[10px] font-medium">Website Builder</span>
            </div>
        </div>
    );
}
