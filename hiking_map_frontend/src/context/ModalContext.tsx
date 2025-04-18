import { useState, useContext, createContext, ReactNode } from 'react';

type ModalState = {
    upload: boolean;
};

type ModalContextType = {
    uiModal: ModalState;
    setUiModal: React.Dispatch<React.SetStateAction<ModalState>>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [uiModal, setUiModal] = useState<ModalState>({
        upload: false,
    });

    return <ModalContext.Provider value={{ uiModal, setUiModal }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal 必須包在 <ModalProvider> 內');
    return context;
};
