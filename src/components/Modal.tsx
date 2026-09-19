import React from "react";
import "./css/Modal.css"; // We'll create a matching CSS file

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  backgroundClassName?: string;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  children,
  backgroundClassName = "modal-background",
  contentClassName = "modal-content",
}) => {
  //   if (!isOpen) return null; // Don't render anything if not open

  return (
    <div className={backgroundClassName} onClick={onClose}>
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
