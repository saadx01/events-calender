// TopButtons.jsx
import React, { useRef } from 'react';
import { saveAs } from 'file-saver';

export default function TopButtons({ setBackgroundImage, userNotes }) {
  const fileInputRef = useRef();

  // --- HANDLE BACKGROUND IMAGE CHANGE ---
  const handleChangeBgClick = () => {
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
        setBackgroundImage(data.path); // inform CalendarPage
      }
    } catch (err) {
      console.error("Theme upload failed:", err);
    }
  };

  // --- HANDLE CALENDAR DOWNLOAD ---
  const handleDownloadClick = async () => {
    if (!window.ar_event_calendar_data) {
      console.warn("ar_event_calendar_data not available. Not able to download calender.");
      return;
    }

    const { root_url } = window.ar_event_calendar_data;

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    // Build data payload
    const calendarData = {
      month,
      year,
    };

    for (let i = 0; i < 43; i++) {
      calendarData[`day${i + 1}`] = '';
      calendarData[`icon${i}`] = '';
      calendarData[`event${i}`] = '';
    }

    Object.entries(userNotes || {}).forEach(([dateStr, note]) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      if (day >= 1 && day <= 31) {
        const index = day - 1;
        calendarData[`day${index + 1}`] = day;
        calendarData[`event${index}`] = note;
      }
    });

    try {
      const res = await fetch(`${root_url}/wp-json/document_generator/v1/generatepdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarData)
      });

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonErr) {
          // Response might not be JSON
          const text = await res.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(`PDF generation failed: ${errorMsg}`);
      }

      const blob = await res.blob();
      saveAs(blob, 'calendar.pdf');
      console.log("Download successful: calendar.pdf");
    } catch (err) {
      console.error("Download failed:", err.message);
    }

  };

  return (
    <div className="top-bar">
      <button className='button-effect' onClick={handleChangeBgClick}>Change Background</button>
      <button className='button-effect'>Filter Activities</button>
      <button className='button-effect' onClick={handleDownloadClick}>Download Calendar</button>

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