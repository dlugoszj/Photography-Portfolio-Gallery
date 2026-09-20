import { useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "./css/home.css";
import "/src/assets/css/fonts.css";
import "./css/photogrid.css";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, doc, onSnapshot, deleteDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "../../firebaseConfig";
import Gallery from "react-photo-gallery";
import { RenderImageProps } from "react-photo-gallery";
import AddImageModal from "../../components/AddImageModal";
import EnlargedImageModal from "../../components/EnlargedImageModal";
import * as utils from "../../utils/utils";

const db = getFirestore(app);
const storage = getStorage(app);

interface Photo {
  src: string;
  originalImageSrc: string;
  width: number;
  height: number;
  name: string;
}

interface ImageGalleryInfo {
  adminMode?: boolean;
}
const handleAddImage = async (files: FileList | null, collectionPath: string) => {
  if (files == null) {
    return;
  }

  for (const file of files) {
    const docRef = doc(collection(db, collectionPath));
    const filePath = collectionPath + docRef.id;
    // Create reference to storage in firebase using the newly created document ID
    const storageRef = await ref(storage, filePath);

    // Upload the file to storage in firebase
    await utils.uploadImage(file, storageRef, docRef, filePath);
  }
};

const handleDelete = async (_collection: string, docId: string) => {
  const docRef = doc(db, docId);
  const docObject = await getDoc(docRef);

  await deleteDoc(doc(db, docId))
    .then((_snapshot) => {
      console.log("Deleted document from database");
    })
    .catch((error) => {
      console.error("Failed to delete document from database", error);
    });
  if (docObject.exists()) {
    await deleteObject(ref(storage, docObject.data().fullSizedImageURL))
      .then(() => {
        console.log("Deleted ", docObject.data().imageURL);
      })
      .catch((error) => {
        console.error("Error occurred in deleting file from Firebase storage", error);
      });
    await deleteObject(ref(storage, docObject.data().thumbnailURL))
      .then(() => {
        console.log("Deleted ", docObject.data().thumbnailURL);
      })
      .catch((error) => {
        console.error("Error occurred in deleting file from Firebase storage", error);
      });
  } else {
    console.log("did not enter");
  }
};

const ImageGallery: React.FC<ImageGalleryInfo> = ({ adminMode = false }) => {
  const { categoryId, galleryId } = useParams();
  if (!galleryId) {
    return <div className="text-white">Invalid gallery ID</div>;
  }
  return <ImageGalleryContent categoryId={categoryId} galleryId={galleryId} adminMode={adminMode} />;
};

type ImageGalleryContentProps = {
  categoryId?: string;
  galleryId: string;
  adminMode: boolean;
};

const ImageGalleryContent: React.FC<ImageGalleryContentProps> = ({ categoryId, galleryId, adminMode }) => {
  const [Photos, setPhotos] = useState<Photo[]>([]);
  const [galleryTitle, setGalleryTitle] = useState<string>("");

  useEffect(() => {
    const fetchTitle = async () => {
      const firebaseDocumentPath = `albumCategories/${categoryId}/albums/${galleryId}`;
      const name = await utils.getDocumentName(firebaseDocumentPath);
      setGalleryTitle(name);
    };
    fetchTitle();
  }, [categoryId, galleryId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `albumCategories/${categoryId}/albums/${galleryId}/images/`),
      async (querySnapshot) => {
        const photoData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const url = await getDownloadURL(ref(storage, data.thumbnailURL));
            const w = data.width;
            const h = data.height;
            const originalImageURL = await getDownloadURL(ref(storage, data.fullSizedImageURL));
            const title = data.imageURL;
            return { src: url, width: Number(w), height: Number(h), name: title, originalImageSrc: originalImageURL };
          })
        );
        setPhotos(photoData);
      }
    );
    return () => unsubscribe();
  }, [categoryId, galleryId]);

  const [openModal, setOpenModal] = useState<null | "add" | "delete" | "edit">(null);
  const [_selectedAlbum, setSelectedAlbum] = useState<string>();

  // Open Add Modal
  const handleOpenAddModal = () => {
    setOpenModal("add");
  };

  // Close Modal
  const handleCloseModal = () => {
    setSelectedAlbum(undefined);
    setOpenModal(null);
  };

  const customRenderImage: React.FC<RenderImageProps> = ({ photo, index, left, top, margin, direction }) => {
    const customPhoto = photo as Photo;
    return (
      <div
        style={{
          margin: margin,
          cursor: "pointer",
          position: direction === "column" ? "absolute" : "relative",
          left: left,
          top: top,
          backgroundColor: "#eee",
          overflow: "hidden",
        }}
        onClick={() => openImageModal(photo.src, customPhoto.name, customPhoto.originalImageSrc)}
      >
        <img src={photo.src} width={photo.width} height={photo.height} alt={`Image ${index}`} />
      </div>
    );
  };
  const [selectedImage, setSelectedImage] = useState<[string, string, string] | [null, null, null]>([null, null, null]);

  const openImageModal = (imageSrc: string, imageName: string, enlargedImageURL: string) =>
    setSelectedImage([imageSrc, imageName, enlargedImageURL]);
  const closeModal = () => setSelectedImage([null, null, null]);
  return (
    <div className="w-full h-screen overflow-x-hidden">
      <NavBar />
      <div className="albumHeading">{galleryTitle.toUpperCase().split("").join("\u00A0")}</div>
      {adminMode && (
        <div className="admin-content text-neutral-200 ">
          <button onClick={handleOpenAddModal} className="add-button">
            Add
          </button>
          {openModal == "add" && (
            <AddImageModal
              onClose={handleCloseModal}
              onSave={handleAddImage}
              collectionPath={`albumCategories/${categoryId}/albums/${galleryId}/images/`}
            />
          )}
        </div>
      )}
      {Photos.length > 0 && <Gallery photos={Photos} direction="column" renderImage={customRenderImage} />}
      {selectedImage[0] && (
        <EnlargedImageModal
          onDelete={handleDelete}
          collectionPath={`albumCategories/${categoryId}/albums/${galleryId}/images/`}
          galleryName={selectedImage[1]}
          enlargedImageURL={selectedImage[2]}
          adminMode={adminMode}
          imageSrc={selectedImage[0]}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ImageGallery;
