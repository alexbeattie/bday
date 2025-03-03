import { getStorage, ref, uploadBytes } from "firebase/storage";
import { auth } from "@/firebase/config";

export async function POST(req) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const storage = getStorage();
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `birthday-images/${fileName}`);

    const buffer = await file.arrayBuffer();
    await uploadBytes(storageRef, new Uint8Array(buffer));

    return new Response(JSON.stringify({ success: true, fileName }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
