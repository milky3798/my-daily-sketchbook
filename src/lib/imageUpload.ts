export async function uploadImage(file: File) {
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = async () => {

      const base64 = reader.result.split(",")[1];

      const res = await fetch("/.netlify/functions/upload-image", {
        method: "POST",
        body: JSON.stringify({
          filename: Date.now() + "-" + file.name,
          content: base64
        }),
      });

      const data = await res.json();

      resolve(data.url);
    };

    reader.readAsDataURL(file);
  });
}
