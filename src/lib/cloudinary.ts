// src/lib/uploadFile.ts

const CLOUD_NAME = 'doy41kse4';    
const UPLOAD_PRESET = 'repomind_preset'; 

export async function uploadFileToCloudinary(
  file: File,
  setProgress?: (progress: number) => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && setProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url); // public URL of uploaded file
        } else {
          reject(`Upload failed: ${xhr.responseText}`);
        }
      }
    };

    xhr.onerror = () => reject('Network error during upload');
    xhr.send(formData);
  });
}
