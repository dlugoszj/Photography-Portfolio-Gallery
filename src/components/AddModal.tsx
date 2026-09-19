import { useState } from "react";
import Modal from "./Modal";
import "./css/Modal.css";

interface AddAlbumModalProps {
  onClose: () => void;
  onSave: (title: string, description: string, file: File | null, collectionPath: string) => void;
  collectionPath: string;
}

const AddAlbumModal: React.FC<AddAlbumModalProps> = ({ onClose, onSave, collectionPath }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const isSaveDisabled = !title.trim() || !file || !description.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title, description, file, collectionPath);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Add New Gallery</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Album Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Album Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
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

export default AddAlbumModal;
