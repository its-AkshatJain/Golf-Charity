import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/upload-proof
// Accepts multipart/form-data: file (image) + winningId
// Uploads to Cloudinary, then saves URL to winnings.proof_url
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const winningId = formData.get("winningId") as string;

    if (!file || !winningId) {
      return NextResponse.json({ error: "Missing file or winning ID" }, { status: 400 });
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    // Validate it belongs to this user and is pending
    const { data: winning } = await supabase
      .from("winnings")
      .select("id, status, user_id")
      .eq("id", winningId)
      .eq("user_id", user.id)
      .single();

    if (!winning) {
      return NextResponse.json({ error: "Winning not found" }, { status: 404 });
    }
    if (winning.status !== "pending") {
      return NextResponse.json({ error: "This winning is not in pending state." }, { status: 400 });
    }

    // ─── CLOUDINARY UPLOAD ───────────────────────────────────────
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env.local." },
        { status: 500 }
      );
    }

    // Convert file to base64 for Cloudinary REST API (no SDK needed)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Generate Cloudinary signature — must be SHA-1, params sorted alphabetically
    const timestamp = Math.round(Date.now() / 1000);
    // Params sorted alphabetically (Cloudinary requirement)
    const paramsToSign = `folder=golf-charity/proofs&timestamp=${timestamp}`;

    const { createHash } = await import("crypto");
    const signature = createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", dataUri);
    cloudinaryForm.append("api_key", apiKey);
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("signature", signature);
    cloudinaryForm.append("folder", "golf-charity/proofs");

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    const cloudData = await cloudRes.json();

    if (!cloudRes.ok || !cloudData.secure_url) {
      console.error("Cloudinary error:", cloudData);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary." },
        { status: 500 }
      );
    }

    const proofUrl = cloudData.secure_url;

    // ─── SAVE TO DATABASE ────────────────────────────────────────
    const { error: dbError } = await supabase
      .from("winnings")
      .update({ proof_url: proofUrl })
      .eq("id", winningId)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json({ error: "Failed to save proof URL." }, { status: 500 });
    }

    return NextResponse.json({ success: true, proofUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
