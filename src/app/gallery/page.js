// File: src/app/gallery/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { storage } from "../../firebase/config";

// Fallback mock images in case Firebase fetch fails
const mockImages = [
  { id: 1, url: '/api/placeholder/400/300', sender: 'John', message: 'Happy birthday! Remember our trip to the beach?' },
  { id: 2, url: '/api/placeholder/400/300', sender: 'Amy', message: 'Wishing you the best day ever!' },
  { id: 3, url: '/api/placeholder/400/300', sender: 'Michael', message: 'Another year, another adventure!' },
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Try to fetch from Firebase
        const q = query(
          collection(db, 'birthdayImages'),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedImages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Format timestamp if needed
          formattedDate: doc.data().timestamp?.toDate().toLocaleDateString()
        }));

        if (fetchedImages.length > 0) {
          setImages(fetchedImages);
        } else {
          // If no images found in Firebase, use mock data
          setImages(mockImages);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fall back to mock data if Firebase fails
        setImages(mockImages);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center bg-[#fefcff]">
      <main className="py-16 flex-1 flex flex-col justify-center items-center text-center max-w-6xl w-full">
        <h1 className="m-0 mb-8 text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ff9e7d] to-[#ffd670] text-transparent bg-clip-text">
          Birthday Memories Gallery
        </h1>

        {loading ? (
          <p className="text-lg">Loading memories...</p>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mb-8">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer transition-all hover:translate-y-[-5px] hover:shadow-lg"
                onClick={() => openModal(image)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Memory from ${image.sender}`}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium">From: {image.sender}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 my-8">No memories have been shared yet. Be the first!</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/upload">
            <button className="bg-gradient-to-r from-[#ff6b6b] to-[#ff9e7d] text-white border-none py-3 px-6 rounded-md text-base cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md min-w-48">
              Share Your Photos
            </button>
          </Link>

          <Link href="/">
            <button className="bg-gray-100 text-gray-800 border border-gray-300 py-3 px-6 rounded-md text-base cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md min-w-48">
              Back to Home
            </button>
          </Link>
        </div>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white max-w-4/5 max-h-[90vh] rounded-lg overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="absolute top-2 right-4 text-white text-2xl font-bold cursor-pointer z-10 drop-shadow-md"
              onClick={closeModal}
            >
              &times;
            </span>
            <img
              src={selectedImage.url}
              alt={`Memory from ${selectedImage.sender}`}
              className="w-full max-h-[70vh] object-contain"
            />
            <div className="p-4">
              <p className="font-semibold mb-2">From: {selectedImage.sender}</p>
              <p className="leading-normal">{selectedImage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}