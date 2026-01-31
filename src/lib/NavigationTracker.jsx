import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
    const location = useLocation();

    // The previous code logged analytics to the Base44 platform.
    // Since you have moved off-platform, this is no longer needed.
    // You can add your own analytics here (like Google Analytics) later if you want.
    
    useEffect(() => {
        // Optional: console.log to see navigation in your dev tools
        console.log('Navigated to:', location.pathname);
    }, [location]);

    return null;
}