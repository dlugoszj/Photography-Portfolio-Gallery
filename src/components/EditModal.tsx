import { useState } from "react";
import Modal from "./Modal";
import "./css/Modal.css";

interface EditModalProps {
  onClose: () => void;
  onEdit: (
    collectionPath: string,
    galleryName: string,
    newTitle: string,
    newDescription: string,
    newCoverImage: File | null
  ) => void;
  collectionPath: string;
  galleryName: string;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, onEdit, collectionPath, galleryName }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // const [error, setError] = useState<string>("");
  const isSaveDisabled = !title.trim() && !file && !description.trim();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(collectionPath, galleryName, title, description, file);
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h2>Edit Album</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Album Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          type="text"
          placeholder="Album Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={isSaveDisabled} className="save-button">
          Save
        </button>
        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </form>
    </Modal>
  );
};

export default EditModal;
