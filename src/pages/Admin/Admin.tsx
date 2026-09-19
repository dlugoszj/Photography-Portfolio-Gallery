import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseConfig"; // Ensure this points to your Firebase setup
import "../Home/photogrid.css";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";

const db = getFirestore(app);
const storage = getStorage(app);

interface GalleryItem {
  id: string;
  title: string;
  coverImageUrl: string;
}

const Admin: React.FC = () => {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      const querySnapshot = await getDocs(collection(db, "albumCategories"));
      const galleryData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          const url = await getDownloadURL(ref(storage, data.coverImageUrl));
          return { id: doc.id, title: data.title, coverImageUrl: url };
        })
      );
      setGalleries(galleryData);
    };

    fetchGalleries().catch(console.error);
  }, []);

  return (
    <div className="">
      <NavBar />
      <div className="text-5xl text-center my-8 text-neutral-200">Admin View</div>
      <div className="mx-auto container grid grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link to={`/${gallery.id}`} className="group transition-all mb-2">
            <div className="flex flex-col items-center">
              <img src={gallery.coverImageUrl} alt={gallery.title} className="album-image" />
              <div className="mt-4 text-center text-neutral-200">
                <strong>{gallery.title}</strong>
                <p className="text-xs">{gallery.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Admin;
