import App from './App.tsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';
import { GeojsonProvider } from './context/GeojsonContext';
import { ModalProvider } from './context/ModalContext';
import { PatchDataProvider } from './context/PatchDataContext';
import { MapProvider } from './context/MapContext';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <GeojsonProvider>
                <PanelProvider>
                    <PolylineProvider>
                        <TableProvider>
                            <ModalProvider>
                                <MapProvider>
                                    <PatchDataProvider>
                                        <BrowserRouter>
                                            <App />
                                        </BrowserRouter>
                                    </PatchDataProvider>
                                </MapProvider>
                            </ModalProvider>
                        </TableProvider>
                    </PolylineProvider>
                </PanelProvider>
            </GeojsonProvider>
        </AuthProvider>
    </React.StrictMode>,
);
