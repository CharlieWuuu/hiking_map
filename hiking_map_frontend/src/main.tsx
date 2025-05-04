import App from './App.tsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { PanelProvider } from './context/PanelContext';
import { PolylineProvider } from './context/PolylineContext';
import { ModalProvider } from './context/ModalContext';
import { PatchDataProvider } from './context/PatchDataContext';
import { MapProvider } from './context/MapContext';
import { FullScreenProvider } from './context/FullScreenContext.tsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <PanelProvider>
                <PolylineProvider>
                    <ModalProvider>
                        <MapProvider>
                            <PatchDataProvider>
                                <BrowserRouter>
                                    <FullScreenProvider>
                                        <App />
                                    </FullScreenProvider>
                                </BrowserRouter>
                            </PatchDataProvider>
                        </MapProvider>
                    </ModalProvider>
                </PolylineProvider>
            </PanelProvider>
        </AuthProvider>
    </React.StrictMode>,
);
