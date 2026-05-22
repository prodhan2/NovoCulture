import { getSettings } from "./firestore";

/**
 * Converts an image to WebP format using the browser's Canvas API.
 * @param {File} file - The original image file.
 * @param {number} quality - The quality of the WebP image (0 to 1).
 * @returns {Promise<Blob>} - The converted WebP image as a Blob.
 */
async function convertToWebP(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("WebP conversion failed"));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to BeeImg with WebP conversion and progress reporting.
 * @param {File} file - The image file to upload.
 * @param {Function} onProgress - Callback for upload progress (0 to 100).
 * @returns {Promise<string>} - The URL of the uploaded image.
 */
export async function uploadImage(file, onProgress) {
  if (!file) throw new Error("No file provided");

  // 1. Get API Key from Firestore
  let apiKey = "";
  try {
    const settings = await getSettings();
    apiKey = settings?.beeImgApiKey;
  } catch (err) {
    console.error("Error fetching settings for API key:", err);
  }

  // If no API key, we can still try to upload without it (BeeImg allows it)
  // But we should warn if it's missing and expected.

  // 2. Convert to WebP
  let uploadBlob = file;
  if (file.type !== "image/webp" && file.size < 5 * 1024 * 1024) { // Only convert if < 5MB to avoid canvas issues
    try {
      if (onProgress) onProgress(5); 
      uploadBlob = await convertToWebP(file);
      if (onProgress) onProgress(15); 
    } catch (err) {
      console.warn("WebP conversion failed, uploading original:", err);
    }
  }

  // 3. Prepare FormData
  const formData = new FormData();
  formData.append("file", uploadBlob, uploadBlob.name || "image.webp");
  if (apiKey) {
    formData.append("apikey", apiKey);
  }

  // 4. Upload with progress using XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Use the official endpoint from documentation
    xhr.open("POST", "https://beeimg.com/api/upload/file/json/");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 80) + 15; 
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log("BeeImg Success Response:", data);
          if (onProgress) onProgress(100);
          
          // According to BeeImg API docs provided:
          // Success structure: { "files": { "url": "...", "status": "Success", ... } }
          const url = data.files?.url || data.url || (Array.isArray(data.files) ? data.files[0]?.url : null) || data.src;
          
          if (url) {
            // Ensure URL is HTTPS
            resolve(url.replace(/^http:/, "https:").trim());
          } else {
            // Check for specific BeeImg error structure in success response
            const statusMsg = data.files?.status || data.message || "Unknown error";
            reject(new Error(`Upload failed: ${statusMsg}`));
          }
        } catch (err) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        console.error("BeeImg Error Response:", xhr.responseText);
        let errorMsg = `Upload failed (Status ${xhr.status})`;
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.error || data.message) errorMsg = data.error || data.message;
        } catch (e) {}
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      console.error("XHR Network Error details:", {
        status: xhr.status,
        statusText: xhr.statusText,
        readyState: xhr.readyState
      });
      reject(new Error("Network error: Could not connect to upload service. Please check your internet or try again later."));
    };
    
    // Set a timeout
    xhr.timeout = 60000; // 60 seconds
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try a smaller file or a faster connection."));

    xhr.send(formData);
  });
}

/**
 * Uploads multiple images to BeeImg with WebP conversion and progress reporting.
 * @param {FileList|File[]} files - The image files to upload.
 * @param {Function} onProgress - Callback for total upload progress (0 to 100).
 * @returns {Promise<string[]>} - Array of URLs of the uploaded images.
 */
export async function uploadImages(files, onProgress) {
  const fileArray = Array.from(files);
  const totalFiles = fileArray.length;
  if (totalFiles === 0) return [];

  const results = [];
  const progresses = new Array(totalFiles).fill(0);

  const updateOverallProgress = () => {
    const totalProgress = progresses.reduce((sum, p) => sum + p, 0) / totalFiles;
    if (onProgress) onProgress(Math.round(totalProgress));
  };

  const uploadPromises = fileArray.map(async (file, index) => {
    try {
      const url = await uploadImage(file, (p) => {
        progresses[index] = p;
        updateOverallProgress();
      });
      results.push(url);
      return url;
    } catch (err) {
      console.error(`Failed to upload file ${index + 1}:`, err);
      progresses[index] = 100; // Mark as "done" (even if failed) for progress calculation
      updateOverallProgress();
      return null;
    }
  });

  await Promise.all(uploadPromises);
  return results.filter(url => url !== null);
}
