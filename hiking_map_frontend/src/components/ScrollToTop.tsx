// ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // pathname 變化時滾動到頂（這樣只有「點新頁」時會觸發）
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
