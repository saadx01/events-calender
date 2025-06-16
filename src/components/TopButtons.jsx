// TopButtons.jsx
import React, { useRef } from 'react';

export default function TopButtons({ onThemeSelected }) {
  const fileInputRef = useRef();

  const handleThemeClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !window.ar_event_calendar_data) return;

    const formData = new FormData();
    formData.append("async-upload", file);
    formData.append("nonce", ar_event_calendar_data.rest_nonce);
    formData.append("compressState", "calendar_bg");

    try {
      const res = await fetch(
        `${ar_event_calendar_data.root_url}/wp-json/activities/v1/upload-bg`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data?.path) {
        onThemeSelected(data.path); // send to CalendarPage
      }
    } catch (err) {
      console.error("Theme upload failed:", err);
    }
  };

  return (
    <div className="top-bar">
      <button onClick={handleThemeClick}>Theme</button>
      <button>Content</button>
      <button>Design</button>
      <button>Download</button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
}



















// import React from 'react';
// export default function TopButtons() {
//   return (

//     <div className="top-bar">
//           <button>Theme</button>
//           <button>Content</button>
//           <button>Design</button>
//           <button>Download</button>
//     </div>
//   );
// }