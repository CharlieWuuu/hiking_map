import { useState, useContext, createContext, ReactNode, useEffect } from 'react';

type ModalContextType = {
    modalIsOpen: boolean;
    setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalType: string | null;
    setModalType: React.Dispatch<React.SetStateAction<string | null>>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState<string | null>(null);

    useEffect(() => {
        console.log(123123);
    }, [modalIsOpen]);

    return <ModalContext.Provider value={{ modalIsOpen, setModalIsOpen, modalType, setModalType }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal 必須包在 <ModalProvider> 內');
    return context;
};
