export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header className="space-y-0.5">
            <h3 className="text-base font-extrabold tracking-tight text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
        </header>
    );
}
