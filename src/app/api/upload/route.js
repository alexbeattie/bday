// In src/app/api/upload/route.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";


export async function POST(req) {
  try {
    console.log("API route: received upload request");

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      console.error("API route: No file provided");
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("API route: File received, name:", file.name);

    // Create a reference to the file location
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `birthday-images/${fileName}`);

    // Upload the file
    const buffer = await file.arrayBuffer();
    console.log("API route: File converted to buffer, uploading...");

    const snapshot = await uploadBytes(storageRef, new Uint8Array(buffer));
    console.log("API route: File uploaded, getting download URL");

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("API route: Upload complete, URL obtained");

    return new Response(JSON.stringify({
      success: true,
      fileName,
      downloadURL
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("API route upload error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Server error during upload"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
// In src/app/api/upload/route.js