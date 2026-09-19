// import { useState } from "react";
import Modal from "./Modal";
import "./css/Modal.css";

interface DeleteModalProps {
  onClose: () => void;
  onDelete: (collectionPath: string, galleryName: string) => void;
  collectionPath: string;
  galleryName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onClose, onDelete, collectionPath, galleryName }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDelete(collectionPath, galleryName);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Delete Album</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="delete-button">
          Delete
        </button>
        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </form>
    </Modal>
  );
};

export default DeleteModal;
