export interface IconDefinition {
    id: string;
    name: string;
    category: 'navigation' | 'actions' | 'communication' | 'business' | 'media' | 'ui';
    keywords: string[];
    paths: string;
}

export const ICON_CATEGORIES = [
    { id: 'all', label: 'All Icons' },
    { id: 'navigation', label: 'Navigation & Arrows' },
    { id: 'actions', label: 'Actions & Status' },
    { id: 'communication', label: 'Communication & Social' },
    { id: 'business', label: 'Commerce & Business' },
    { id: 'media', label: 'Media & Devices' },
    { id: 'ui', label: 'Interface & Utility' },
] as const;

export const ICON_PACK: IconDefinition[] = [
    // Navigation & Arrows
    {
        id: 'arrow-right',
        name: 'Arrow Right',
        category: 'navigation',
        keywords: ['forward', 'next', 'pointer', 'go'],
        paths: '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',
    },
    {
        id: 'arrow-left',
        name: 'Arrow Left',
        category: 'navigation',
        keywords: ['back', 'previous', 'return'],
        paths: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
    },
    {
        id: 'arrow-up',
        name: 'Arrow Up',
        category: 'navigation',
        keywords: ['top', 'ascend', 'above'],
        paths: '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>',
    },
    {
        id: 'arrow-down',
        name: 'Arrow Down',
        category: 'navigation',
        keywords: ['bottom', 'descend', 'below'],
        paths: '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>',
    },
    {
        id: 'arrow-up-right',
        name: 'Arrow Up Right',
        category: 'navigation',
        keywords: ['external', 'link', 'outbound'],
        paths: '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',
    },
    {
        id: 'chevron-right',
        name: 'Chevron Right',
        category: 'navigation',
        keywords: ['angle', 'bracket', 'forward', 'more'],
        paths: '<polyline points="9 18 15 12 9 6"></polyline>',
    },
    {
        id: 'chevron-left',
        name: 'Chevron Left',
        category: 'navigation',
        keywords: ['angle', 'bracket', 'back'],
        paths: '<polyline points="15 18 9 12 15 6"></polyline>',
    },
    {
        id: 'chevron-down',
        name: 'Chevron Down',
        category: 'navigation',
        keywords: ['angle', 'expand', 'dropdown'],
        paths: '<polyline points="6 9 12 15 18 9"></polyline>',
    },
    {
        id: 'chevron-up',
        name: 'Chevron Up',
        category: 'navigation',
        keywords: ['angle', 'collapse'],
        paths: '<polyline points="18 15 12 9 6 15"></polyline>',
    },
    {
        id: 'external-link',
        name: 'External Link',
        category: 'navigation',
        keywords: ['open', 'new window', 'url'],
        paths: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
    },
    {
        id: 'menu',
        name: 'Menu',
        category: 'navigation',
        keywords: ['hamburger', 'drawer', 'navigation', 'bars'],
        paths: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
    },
    {
        id: 'compass',
        name: 'Compass',
        category: 'navigation',
        keywords: ['direction', 'explore', 'map', 'travel'],
        paths: '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',
    },

    // Actions & Status
    {
        id: 'check',
        name: 'Checkmark',
        category: 'actions',
        keywords: ['ok', 'done', 'tick', 'success', 'correct'],
        paths: '<polyline points="20 6 9 17 4 12"></polyline>',
    },
    {
        id: 'check-circle',
        name: 'Check Circle',
        category: 'actions',
        keywords: ['complete', 'verified', 'approved'],
        paths: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
    },
    {
        id: 'plus',
        name: 'Plus',
        category: 'actions',
        keywords: ['add', 'create', 'new'],
        paths: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
    },
    {
        id: 'x',
        name: 'Close / Cancel',
        category: 'actions',
        keywords: ['cross', 'remove', 'delete', 'close'],
        paths: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    },
    {
        id: 'zap',
        name: 'Lightning Bolt',
        category: 'actions',
        keywords: ['power', 'fast', 'energy', 'electric', 'speed'],
        paths: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    },
    {
        id: 'sparkles',
        name: 'Sparkles',
        category: 'actions',
        keywords: ['magic', 'ai', 'clean', 'star', 'highlight', 'special'],
        paths: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>',
    },
    {
        id: 'star',
        name: 'Star',
        category: 'actions',
        keywords: ['favorite', 'rate', 'bookmark', 'best'],
        paths: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
    },
    {
        id: 'heart',
        name: 'Heart',
        category: 'actions',
        keywords: ['love', 'like', 'health', 'favorite'],
        paths: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
    },
    {
        id: 'shield',
        name: 'Shield',
        category: 'actions',
        keywords: ['security', 'protect', 'safe', 'defense'],
        paths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    },
    {
        id: 'shield-check',
        name: 'Shield Check',
        category: 'actions',
        keywords: ['verified', 'secure', 'protection', 'guarantee'],
        paths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>',
    },
    {
        id: 'rocket',
        name: 'Rocket',
        category: 'actions',
        keywords: ['launch', 'startup', 'fast', 'blast', 'publish'],
        paths: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>',
    },
    {
        id: 'award',
        name: 'Award Ribbon',
        category: 'actions',
        keywords: ['badge', 'winner', 'certificate', 'trophy'],
        paths: '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
    },
    {
        id: 'flame',
        name: 'Flame',
        category: 'actions',
        keywords: ['fire', 'hot', 'popular', 'trending'],
        paths: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
    },
    {
        id: 'trophy',
        name: 'Trophy',
        category: 'actions',
        keywords: ['cup', 'first', 'winner', 'achievement'],
        paths: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 4H6v7a6 6 0 0 0 12 0V4Z"></path>',
    },
    {
        id: 'thumbs-up',
        name: 'Thumbs Up',
        category: 'actions',
        keywords: ['like', 'approve', 'agree', 'good'],
        paths: '<path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.5L12 4.25a2.25 2.25 0 0 1 3 1.63Z"></path>',
    },

    // Communication & Social
    {
        id: 'mail',
        name: 'Email / Mail',
        category: 'communication',
        keywords: ['envelope', 'contact', 'message', 'inbox'],
        paths: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
    },
    {
        id: 'message-square',
        name: 'Message Square',
        category: 'communication',
        keywords: ['chat', 'comment', 'talk', 'feedback', 'conversation'],
        paths: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    },
    {
        id: 'phone',
        name: 'Phone',
        category: 'communication',
        keywords: ['call', 'contact', 'telephone', 'mobile'],
        paths: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    },
    {
        id: 'send',
        name: 'Send',
        category: 'communication',
        keywords: ['plane', 'paper', 'submit', 'deliver'],
        paths: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
    },
    {
        id: 'bell',
        name: 'Bell',
        category: 'communication',
        keywords: ['notification', 'alert', 'alarm'],
        paths: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    },
    {
        id: 'share-2',
        name: 'Share',
        category: 'communication',
        keywords: ['publish', 'social', 'network', 'send'],
        paths: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
    },
    {
        id: 'user',
        name: 'User',
        category: 'communication',
        keywords: ['person', 'profile', 'account', 'avatar'],
        paths: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    },
    {
        id: 'users',
        name: 'Users / Team',
        category: 'communication',
        keywords: ['people', 'group', 'community', 'crowd'],
        paths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    },
    {
        id: 'globe',
        name: 'Globe',
        category: 'communication',
        keywords: ['world', 'international', 'web', 'internet', 'earth'],
        paths: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
    },

    // Commerce & Business
    {
        id: 'shopping-cart',
        name: 'Shopping Cart',
        category: 'business',
        keywords: ['ecommerce', 'buy', 'order', 'checkout', 'store'],
        paths: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
    },
    {
        id: 'shopping-bag',
        name: 'Shopping Bag',
        category: 'business',
        keywords: ['ecommerce', 'retail', 'purchase', 'pack'],
        paths: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
    },
    {
        id: 'credit-card',
        name: 'Credit Card',
        category: 'business',
        keywords: ['payment', 'billing', 'money', 'finance'],
        paths: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',
    },
    {
        id: 'dollar-sign',
        name: 'Dollar Sign',
        category: 'business',
        keywords: ['money', 'price', 'cash', 'currency', 'sale'],
        paths: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    },
    {
        id: 'tag',
        name: 'Tag',
        category: 'business',
        keywords: ['label', 'discount', 'badge', 'sale'],
        paths: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path>',
    },
    {
        id: 'briefcase',
        name: 'Briefcase',
        category: 'business',
        keywords: ['work', 'job', 'portfolio', 'company', 'career'],
        paths: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    },
    {
        id: 'trending-up',
        name: 'Trending Up',
        category: 'business',
        keywords: ['growth', 'analytics', 'success', 'increase', 'profit'],
        paths: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
    },
    {
        id: 'bar-chart',
        name: 'Bar Chart',
        category: 'business',
        keywords: ['stats', 'metrics', 'graph', 'report'],
        paths: '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>',
    },
    {
        id: 'pie-chart',
        name: 'Pie Chart',
        category: 'business',
        keywords: ['diagram', 'distribution', 'percentage', 'breakdown'],
        paths: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
    },
    {
        id: 'package',
        name: 'Package',
        category: 'business',
        keywords: ['box', 'delivery', 'shipping', 'order', 'product'],
        paths: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
    },
    {
        id: 'gift',
        name: 'Gift',
        category: 'business',
        keywords: ['present', 'bonus', 'reward', 'offer'],
        paths: '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    },

    // Media & Devices
    {
        id: 'image',
        name: 'Image / Photo',
        category: 'media',
        keywords: ['picture', 'gallery', 'graphic', 'art'],
        paths: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
    },
    {
        id: 'play',
        name: 'Play',
        category: 'media',
        keywords: ['video', 'media', 'start', 'stream'],
        paths: '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
    },
    {
        id: 'video',
        name: 'Video Camera',
        category: 'media',
        keywords: ['film', 'movie', 'record', 'clip'],
        paths: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
    },
    {
        id: 'code',
        name: 'Code',
        category: 'media',
        keywords: ['dev', 'html', 'developer', 'programming', 'brackets'],
        paths: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
    },
    {
        id: 'terminal',
        name: 'Terminal',
        category: 'media',
        keywords: ['console', 'command line', 'bash', 'shell'],
        paths: '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
    },
    {
        id: 'cpu',
        name: 'CPU / Chip',
        category: 'media',
        keywords: ['processor', 'hardware', 'tech', 'smart', 'performance'],
        paths: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>',
    },
    {
        id: 'database',
        name: 'Database',
        category: 'media',
        keywords: ['storage', 'server', 'sql', 'data'],
        paths: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
    },
    {
        id: 'cloud',
        name: 'Cloud',
        category: 'media',
        keywords: ['hosting', 'storage', 'weather', 'sync'],
        paths: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>',
    },
    {
        id: 'smartphone',
        name: 'Smartphone / Mobile',
        category: 'media',
        keywords: ['phone', 'device', 'responsive', 'touch'],
        paths: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',
    },
    {
        id: 'monitor',
        name: 'Monitor / Desktop',
        category: 'media',
        keywords: ['computer', 'screen', 'display', 'pc'],
        paths: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
    },
    {
        id: 'download',
        name: 'Download',
        category: 'media',
        keywords: ['save', 'export', 'arrow down'],
        paths: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
    },
    {
        id: 'upload',
        name: 'Upload',
        category: 'media',
        keywords: ['cloud', 'import', 'arrow up'],
        paths: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
    },

    // Interface & Utility
    {
        id: 'search',
        name: 'Search',
        category: 'ui',
        keywords: ['find', 'magnifier', 'lookup', 'filter'],
        paths: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    },
    {
        id: 'settings',
        name: 'Settings / Gear',
        category: 'ui',
        keywords: ['cog', 'preferences', 'configuration', 'options'],
        paths: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    },
    {
        id: 'sliders',
        name: 'Sliders / Adjust',
        category: 'ui',
        keywords: ['controls', 'equalizer', 'tune', 'filter'],
        paths: '<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>',
    },
    {
        id: 'lock',
        name: 'Lock',
        category: 'ui',
        keywords: ['security', 'private', 'password', 'protected'],
        paths: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    },
    {
        id: 'unlock',
        name: 'Unlock',
        category: 'ui',
        keywords: ['open', 'public', 'access'],
        paths: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
    },
    {
        id: 'eye',
        name: 'Eye / View',
        category: 'ui',
        keywords: ['preview', 'visible', 'watch', 'look'],
        paths: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
    },
    {
        id: 'calendar',
        name: 'Calendar',
        category: 'ui',
        keywords: ['date', 'schedule', 'event', 'month'],
        paths: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    },
    {
        id: 'clock',
        name: 'Clock / Time',
        category: 'ui',
        keywords: ['hour', 'history', 'recent', 'schedule'],
        paths: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    },
    {
        id: 'map-pin',
        name: 'Map Pin',
        category: 'ui',
        keywords: ['location', 'place', 'address', 'marker'],
        paths: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    },
    {
        id: 'home',
        name: 'Home',
        category: 'ui',
        keywords: ['house', 'root', 'main'],
        paths: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    },
    {
        id: 'file-text',
        name: 'Document / File',
        category: 'ui',
        keywords: ['article', 'page', 'content', 'contract'],
        paths: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
    },
    {
        id: 'copy',
        name: 'Copy',
        category: 'ui',
        keywords: ['duplicate', 'clone', 'clipboard'],
        paths: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    },
    {
        id: 'edit-3',
        name: 'Edit / Pen',
        category: 'ui',
        keywords: ['write', 'modify', 'pencil', 'compose'],
        paths: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
    },
    {
        id: 'trash-2',
        name: 'Trash',
        category: 'ui',
        keywords: ['delete', 'remove', 'bin', 'garbage'],
        paths: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
    },
    {
        id: 'refresh-cw',
        name: 'Refresh / Sync',
        category: 'ui',
        keywords: ['reload', 'update', 'repeat', 'arrows'],
        paths: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
    },
    {
        id: 'sun',
        name: 'Sun / Light Mode',
        category: 'ui',
        keywords: ['brightness', 'day', 'warmth'],
        paths: '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
    },
    {
        id: 'moon',
        name: 'Moon / Dark Mode',
        category: 'ui',
        keywords: ['night', 'dark', 'theme'],
        paths: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
    },
];

const ICON_MAP = new Map<string, IconDefinition>(ICON_PACK.map((icon) => [icon.id.toLowerCase(), icon]));

export function getIconDefinition(id: string): IconDefinition | undefined {
    return ICON_MAP.get(id.toLowerCase());
}

export interface RenderIconOptions {
    size?: number | string;
    color?: string;
    className?: string;
    style?: string;
    strokeWidth?: number | string;
}

export function renderIconSvg(iconIdOrCustom: string, options: RenderIconOptions = {}): string {
    const raw = (iconIdOrCustom || '').trim();
    if (!raw) return '';

    const size = options.size ?? 20;
    const sizeStyle = typeof size === 'number' ? `${size}px` : size;
    const color = options.color || 'currentColor';
    const strokeWidth = options.strokeWidth ?? 2;
    const userStyle = options.style ? `; ${options.style}` : '';
    const className = options.className ? ` class="${escapeAttr(options.className)}"` : '';

    // If it's a raw SVG markup
    if (raw.startsWith('<svg') && raw.endsWith('</svg>')) {
        // Inject sizing/colors into existing SVG or wrap
        return `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${sizeStyle}; height: ${sizeStyle}; color: ${escapeAttr(color)}${userStyle}"${className}>${raw}</span>`;
    }

    // If it's an image URL (http, https, /, or data:image)
    if (/^(https?:\/\/|\/|data:image\/)/i.test(raw)) {
        return `<img src="${escapeAttr(raw)}" alt="icon" style="width: ${sizeStyle}; height: ${sizeStyle}; object-fit: contain; display: inline-block; vertical-align: middle${userStyle}"${className} />`;
    }

    // Lookup in pack
    const def = getIconDefinition(raw);
    if (!def) {
        // Fallback for custom or unknown icon name: try default sparkles
        const fallbackDef = getIconDefinition('sparkles') || ICON_PACK[0];
        return `<svg style="width: ${sizeStyle}; height: ${sizeStyle}; color: ${escapeAttr(color)}; display: inline-block; vertical-align: middle; flex-shrink: 0${userStyle}"${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${fallbackDef.paths}</svg>`;
    }

    return `<svg style="width: ${sizeStyle}; height: ${sizeStyle}; color: ${escapeAttr(color)}; display: inline-block; vertical-align: middle; flex-shrink: 0${userStyle}"${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${def.paths}</svg>`;
}

function escapeAttr(val: string): string {
    return val.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
