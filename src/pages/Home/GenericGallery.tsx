import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseConfig";
import "./css/photogrid.css";
import { Link, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import AddAlbumModal from "../../components/AddModal";
import DeleteModal from "../../components/DeleteModal";
import EditModal from "../../components/EditModal";
import * as utils from "../../utils/utils";

const db = getFirestore(app);
const storage = getStorage(app);

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  updatedAt: Date;
}

type galleryType = {
  galleryType: string;
  collectionName?: string;
  adminMode?: boolean;
};

const GenericGallery: React.FC<galleryType> = ({ galleryType, collectionName = "", adminMode = false }) => {
  let pathLink = "";
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const adminPath: string = adminMode ? "admin/" : "";

  const [openModal, setOpenModal] = useState<null | "add" | "delete" | "edit">(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>();

  // Open Add Modal
  const handleOpenAddModal = () => {
    setOpenModal("add");
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (galleryName: string) => {
    setSelectedAlbum(galleryName);
    setOpenModal("delete");
  };

  // Open Edit Modal
  const handleOpenEditModal = (galleryName: string) => {
    setSelectedAlbum(galleryName);
    setOpenModal("edit");
  };

  // Close Modal
  const handleCloseModal = () => {
    setSelectedAlbum(undefined);
    setOpenModal(null);
  };

  if (galleryType == "album") {
    pathLink = categoryId + "/";
    collectionName = "albumCategories/" + categoryId + "/albums";
  }

  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const fetchTitle = async () => {
      if (galleryType === "album") {
        const firebaseDocumentPath = "/albumCategories/" + categoryId;
        const name = await utils.getDocumentName(firebaseDocumentPath);
        setGalleryTitle(name);
      } else {
        setGalleryTitle("GALLERY");
      }
    };
    fetchTitle();
  }, [galleryType, categoryId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), async (snapshot) => {
      const updatedAlbums = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const url = await getDownloadURL(ref(storage, data.coverImageUrl));
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            coverImageUrl: url,
            updatedAt: data.updatedAt,
          };
        })
      );
      setGalleries(updatedAlbums);
    });

    return () => unsubscribe(); // clean up the listener on unmount
  }, [collectionName, location]);

  return (
    <div className="">
      <NavBar />
      <div className="albumHeading">{galleryTitle.toUpperCase().split("").join("\u00A0")}</div>
      {adminMode && (
        <div className="admin-content text-neutral-200 ">
          <button onClick={handleOpenAddModal} className="add-button">
            Add
          </button>
          {openModal == "add" && (
            <AddAlbumModal onClose={handleCloseModal} onSave={utils.handleSaveAlbum} collectionPath={collectionName} />
          )}
        </div>
      )}
      <div className="mx-auto container grid grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <div>
            <Link to={`/${adminPath}${pathLink}${gallery.id}`} className="group transition-all mb-2">
              <div className="flex flex-col items-center">
                <img src={gallery.coverImageUrl} alt={gallery.title} className="album-image" />
                <div className="mt-4 text-center text-neutral-200">
                  <strong>{gallery.title}</strong>
                  <p className="text-xs">{gallery.description}</p>
                </div>
              </div>
            </Link>
            {adminMode && (
              <div className="admin-content ">
                <div className="text-red-500">
                  <button onClick={() => handleOpenDeleteModal(gallery.id)} className="delete-button">
                    Delete
                  </button>
                  {openModal == "delete" && selectedAlbum == gallery.id && (
                    <DeleteModal
                      onClose={handleCloseModal}
                      onDelete={utils.handleDelete}
                      collectionPath={collectionName}
                      galleryName={gallery.id}
                    />
                  )}
                </div>
                <div className="text-blue-500">
                  <button onClick={() => handleOpenEditModal(gallery.id)} className="edit-button">
                    Edit
                  </button>
                  {openModal == "edit" && selectedAlbum == gallery.id && (
                    <EditModal
                      onClose={handleCloseModal}
                      onEdit={utils.handleUpdate}
                      collectionPath={collectionName}
                      galleryName={gallery.id}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenericGallery;
