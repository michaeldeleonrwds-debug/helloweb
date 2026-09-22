import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 8V32M8 20H22M22 8V32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 12C30.314 12 33 14.686 33 18V32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}
