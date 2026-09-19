// import { useState } from "react";
import Modal from "./Modal";
import "./css/Modal.css";

interface EnlargedImageModalProps {
  onClose: () => void;
  onDelete: (collectionPath: string, galleryName: string) => void;
  collectionPath: string;
  galleryName: string;
  enlargedImageURL: string;
  imageSrc?: string;
  adminMode?: boolean;
}

// This modal opens up an enlarged version of the image and if
// the user is in admin mode it will also display a delete button to
// remove the image.
const EnlargedImageModal: React.FC<EnlargedImageModalProps> = ({
  onClose,
  onDelete,
  collectionPath,
  galleryName,
  enlargedImageURL,
  imageSrc,
  adminMode = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    console.log("IMAGE SRC");
    console.log(imageSrc);
    console.log("galleryName");
    console.log(galleryName);
    console.log("enlargeImageUrl");
    console.log(enlargedImageURL);
    e.preventDefault();
    onDelete(collectionPath, galleryName);
    onClose();
  };

  return (
    <Modal onClose={onClose} backgroundClassName="image-modal-background" contentClassName="image-modal-content">
      <img src={enlargedImageURL}></img>
      {adminMode && (
        <button className="delete-button" onClick={handleSubmit}>
          Delete Image
        </button>
      )}
    </Modal>
  );
};

export default EnlargedImageModal;
