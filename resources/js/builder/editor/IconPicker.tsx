import { Check, Code2, Image as ImageIcon, Search, Trash2, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

import { ICON_CATEGORIES, ICON_PACK, getIconDefinition, renderIconSvg } from '../icons/icon-pack';

export interface IconPickerProps {
    value?: string;
    customIcon?: string;
    onChange: (iconName: string, customIcon?: string) => void;
    onClear?: () => void;
    label?: string;
    color?: string;
}

export function IconPicker({
    value = '',
    customIcon = '',
    onChange,
    onClear,
    label = 'Select Icon',
    color = 'currentColor',
}: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'pack' | 'custom'>('pack');
    const [customInput, setCustomInput] = useState(customIcon || (value.startsWith('<svg') || value.startsWith('http') || value.startsWith('/') ? value : ''));

    const activeIconId = value && !value.startsWith('<svg') && !value.startsWith('http') && !value.startsWith('/') ? value : '';
    const isCustomActive = Boolean(customIcon || value.startsWith('<svg') || value.startsWith('http') || value.startsWith('/'));

    const filteredIcons = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return ICON_PACK.filter((icon) => {
            const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!query) return true;
            return (
                icon.id.toLowerCase().includes(query) ||
                icon.name.toLowerCase().includes(query) ||
                icon.keywords.some((k) => k.toLowerCase().includes(query))
            );
        });
    }, [searchQuery, selectedCategory]);

    const activeIconDef = activeIconId ? getIconDefinition(activeIconId) : undefined;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label ? <span className="text-xs font-medium text-slate-700">{label}</span> : null}

            {/* Trigger Button & Preview */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50/80 transition"
                >
                    <div
                        className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200/80 bg-slate-50 text-slate-700"
                        dangerouslySetInnerHTML={{
                            __html: isCustomActive
                                ? renderIconSvg(customInput || customIcon || value, { size: 16, color })
                                : activeIconId
                                  ? renderIconSvg(activeIconId, { size: 16, color })
                                  : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
                        }}
                    />
                    <div className="min-w-0 flex-1 truncate">
                        {isCustomActive ? (
                            <span className="font-semibold text-blue-600">Custom Icon</span>
                        ) : activeIconDef ? (
                            <span className="font-medium text-slate-900">{activeIconDef.name}</span>
                        ) : (
                            <span className="text-slate-400">Choose from Icon Pack...</span>
                        )}
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Browse
                    </span>
                </button>

                {(activeIconId || isCustomActive) && onClear ? (
                    <button
                        type="button"
                        onClick={onClear}
                        title="Remove icon"
                        aria-label="Remove icon"
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                ) : null}
            </div>

            {/* Modal Dialog */}
            {isOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Icon Library</h3>
                                <p className="text-xs text-slate-500">
                                    Search our built-in icon pack or paste custom SVG/image URL
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-medium text-slate-600">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('pack')}
                                        className={`rounded-md px-3 py-1 transition ${activeTab === 'pack' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                                    >
                                        Icon Pack ({ICON_PACK.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('custom')}
                                        className={`rounded-md px-3 py-1 transition ${activeTab === 'custom' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                                    >
                                        Custom Icon
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>

                        {activeTab === 'pack' ? (
                            <>
                                {/* Search & Category Filters */}
                                <div className="border-b border-slate-100 bg-slate-50/50 p-4 space-y-3">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search icons by name, keyword (e.g. arrow, check, heart, cart)..."
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                                            autoFocus
                                        />
                                        {searchQuery ? (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        ) : null}
                                    </div>

                                    {/* Category Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                                        {ICON_CATEGORIES.map((cat) => {
                                            const isSelected = selectedCategory === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                                                        isSelected
                                                            ? 'bg-slate-900 text-white shadow-xs'
                                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Icon Grid */}
                                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                                    {filteredIcons.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Search className="size-8 text-slate-300 mb-2" />
                                            <p className="text-xs font-semibold text-slate-700">No matching icons found</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Try searching for generic terms or switch category
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                            {filteredIcons.map((icon) => {
                                                const isSelected = activeIconId.toLowerCase() === icon.id.toLowerCase() && !isCustomActive;
                                                return (
                                                    <button
                                                        key={icon.id}
                                                        type="button"
                                                        onClick={() => {
                                                            onChange(icon.id, '');
                                                            setIsOpen(false);
                                                        }}
                                                        title={`${icon.name} (${icon.id})`}
                                                        className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                                                            isSelected
                                                                ? 'border-blue-500 bg-blue-50/70 text-blue-600 ring-2 ring-blue-200'
                                                                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <div
                                                            className="flex size-7 items-center justify-center group-hover:scale-110 transition-transform"
                                                            dangerouslySetInnerHTML={{
                                                                __html: renderIconSvg(icon.id, { size: 20 }),
                                                            }}
                                                        />
                                                        <span className="w-full truncate text-[10px] font-medium text-slate-600 group-hover:text-slate-900">
                                                            {icon.name}
                                                        </span>
                                                        {isSelected ? (
                                                            <div className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-blue-600 text-white">
                                                                <Check className="size-2.5 stroke-[3]" />
                                                            </div>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Custom Icon Tab */
                            <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                        <Code2 className="size-3.5 text-blue-600" />
                                        Custom SVG Markup or Image URL
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Paste raw &lt;svg&gt;...&lt;/svg&gt; XML markup, or enter an image URL (PNG, SVG, WebP).
                                    </p>
                                    <textarea
                                        rows={5}
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg> or https://example.com/icon.svg'
                                        className="w-full font-mono text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Custom Icon Preview */}
                                {customInput.trim() ? (
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                                        <div
                                            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xs"
                                            dangerouslySetInnerHTML={{
                                                __html: renderIconSvg(customInput, { size: 24 }),
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-slate-900">Custom Icon Preview</p>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                {customInput.startsWith('<svg') ? 'Valid SVG Markup' : customInput}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomInput('');
                                            onChange('', '');
                                            setIsOpen(false);
                                        }}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!customInput.trim()}
                                        onClick={() => {
                                            onChange('', customInput.trim());
                                            setIsOpen(false);
                                        }}
                                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        Apply Custom Icon
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3">
                            <div className="text-xs text-slate-500">
                                {activeIconId || isCustomActive ? (
                                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                        Active: <code className="rounded bg-slate-200/80 px-1 py-0.5 text-[11px] text-slate-800">{activeIconId || 'custom'}</code>
                                    </span>
                                ) : (
                                    'No icon currently selected'
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {(activeIconId || isCustomActive) && onClear ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClear();
                                            setIsOpen(false);
                                        }}
                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                    >
                                        Remove Icon
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
