import { useState, useRef } from "react"
import { API_BASE } from "../config"

export default function ImageUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  async function handleUpload(file) {
    if (!file) return
    setUploading(true)
    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append("image", file)

    try {
      const resp = await fetch(`${API_BASE}/api/uploads/images/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      const data = await resp.json()
      onUploaded(data) // callback with {id, url, ...}
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleUpload(file)
  }

  return (
    <div
      className="border border-secondary rounded p-3 text-center"
      style={{ cursor: "pointer" }}
      onClick={() => fileInputRef.current.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={(e) => handleUpload(e.target.files[0])}
      />
      {uploading ? (
        <div>Uploading…</div>
      ) : preview ? (
        <img
          src={preview}
          alt="Preview"
          style={{ maxWidth: "100%", maxHeight: 200 }}
        />
      ) : (
        <div>Drag & Drop or Click to Upload</div>
      )}
    </div>
  )
}
