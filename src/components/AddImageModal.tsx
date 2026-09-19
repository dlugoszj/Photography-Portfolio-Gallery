import { useState } from "react";
import Modal from "./Modal";
import "./css/Modal.css";

interface AddAlbumModalProps {
  onClose: () => void;
  onSave: (files: FileList | null, collectionPath: string) => void;
  collectionPath: string;
}

const AddImageModal: React.FC<AddAlbumModalProps> = ({ onClose, onSave, collectionPath }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const isSaveDisabled = !files || files.length > 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(files, collectionPath);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Add Images (Maximum of 5 Images at a Time)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} multiple />
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

export default AddImageModal;
