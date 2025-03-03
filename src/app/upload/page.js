"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { storage, db } from "@/firebase/config";
import Link from "next/link";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Upload() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser) {
        console.log("User authenticated:", loggedInUser.email);
        setUser(loggedInUser);
      } else {
        console.error("User NOT authenticated");
        setUser(null);
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Prevent rendering the page until authentication check is done
  if (loading) return <p>Loading...</p>;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);

    // Create preview URLs
    const newPreviewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls((prevUrls) => {
      prevUrls.forEach((url) => URL.revokeObjectURL(url)); // Avoid memory leaks
      return newPreviewUrls;
    });
  };

  // Modify your handleSubmit function in the Upload component:
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = images.map(async (image) => {
        console.log("Preparing to upload image:", image.name);

        // Create a form data object
        const formData = new FormData();
        formData.append("file", image);

        console.log("Sending request to /api/upload");
        // Upload via API route instead of directly to Firebase
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        console.log("Response status:", response.status);

        // Log the raw response text for debugging
        const responseText = await response.text();
        console.log("Response text:", responseText);
        // Parse the JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error("Invalid server response");
        }
        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }
        console.log("Upload successful, URL:", data.downloadURL);

        // Add document to Firestore (your API could do this too)
        await addDoc(collection(db, "birthdayImages"), {
          url: data.downloadURL,
          sender: name || "Anonymous",
          message: message || "",
          fileName: data.fileName,
          userId: user.uid,
          timestamp: serverTimestamp(),
        });

        return data.downloadURL;
      });

      await Promise.all(uploadPromises);

      setSubmitted(true);
      setUploading(false);
      setImages([]);
      setMessage("");
      setPreviewUrls([]);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      alert("There was an error uploading your images. Please try again.");
    }
  };
  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center bg-[#fefcff]">
      <main className="py-16 flex-1 flex flex-col justify-center items-center text-center max-w-4xl w-full">
        <h1 className="m-0 mb-8 text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ff9e7d] to-[#ffd670] text-transparent bg-clip-text">
          Share Your Memories
        </h1>

        <button
          onClick={handleLogout}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-md"
        >
          Logout
        </button>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl text-left"
          >
            <div className="mb-6">
              <label htmlFor="name" className="block mb-2 font-medium">
                Your Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-md text-base"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block mb-2 font-medium">
                Your Birthday Message:
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a birthday wish or share a memory..."
                className="w-full p-3 border border-gray-300 rounded-md text-base"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="images" className="block mb-2 font-medium">
                Select Photos:
              </label>
              <input
                type="file"
                id="images"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 font-medium">Image Previews:</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded border border-gray-200"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ff9e7d] text-white border-none py-3 px-6 rounded-md text-base cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl text-center mb-6">
            <h2 className="text-[#ff6b6b] text-2xl font-bold mb-4">
              Thank You!
            </h2>
            <p className="mb-6">
              Your photos and message have been uploaded successfully.
            </p>
            <Link href="/gallery">
              <button className="bg-gradient-to-r from-[#ff6b6b] to-[#ff9e7d] text-white border-none py-3 px-6 rounded-md text-base cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md w-full mb-4">
                View Gallery
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
