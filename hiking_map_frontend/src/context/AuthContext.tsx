import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
    id: string;
    username: string;
    uuid: string;
    exp: number;
};

type AuthContextType = {
    isLoggedIn: boolean;
    user: { id: string; username: string; uuid: string } | null;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                const now = Date.now() / 1000;
                if (decoded.exp > now) {
                    setUser({ id: decoded.id, username: decoded.username, uuid: decoded.uuid });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (err) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (token: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const now = Date.now() / 1000;
            if (decoded.exp > now) {
                setUser({ id: decoded.id, username: decoded.username, uuid: decoded.uuid });
                localStorage.setItem('token', token);
            }
        } catch {
            console.warn('無法解析 token');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                login,
                logout,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth 必須包在 <AuthProvider> 裡使用');
    return context;
}
