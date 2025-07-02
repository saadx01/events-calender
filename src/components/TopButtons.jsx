// TopButtons.jsx
import React, { useRef } from 'react';
import { saveAs } from 'file-saver';

export default function TopButtons({ setBackgroundImage, userNotes, backgroundImage, calendarRef, events  }) {

//   const events= [
//   { title: "World Health Day", start: "2025-05-05" },
//   { title: "Mothers's Day (UK, USA, Canada)", start: "2025-05-15" },
//   { title: "World War I Anniversary", start: "2025-05-15" },
//   { title: "End of Term Dinner", start: "2025-05-29" },
//   { title: "World Environment Day", start: "2025-06-05" },
//   { title: "Father's Day (UK, USA, Canada)", start: "2025-06-15" },
//   { title: "World War II Anniversary", start: "2025-06-15" },
//   { title: "End of Term Party", start: "2025-06-25" }
// ]
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

function prepareCalendarData(calendarApi, events, userNotes, backgroundImage) {
  const viewStartDate = new Date(calendarApi?.view?.currentStart);

  const month = viewStartDate.toLocaleString('default', { month: 'long' });
  const year = viewStartDate.getFullYear();

  const calendarData = {
    month,
    year,
  };

  // Initialize all required fields
  for (let i = 0; i < 43; i++) {
    if (i !== 42) {
      calendarData[`day${i + 1}`] = '';   // 1-42
    }
    calendarData[`icon${i}`] = '';        // 0-42
    calendarData[`event${i}`] = '';       // 0-42
  }

  // --- Set all `dayX` fields correctly ---
  const firstDayOfMonth = new Date(year, viewStartDate.getMonth(), 1);
  const lastDayOfMonth = new Date(year, viewStartDate.getMonth() + 1, 0);
  const startIndex = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let day = 1;
  for (let i = startIndex; day <= lastDayOfMonth.getDate(); i++) {
    calendarData[`day${i + 1}`] = day;
    day++;
  }

  // Fill dynamic notes and events into the correct `eventX` index
  const eventMap = {};
  (events || []).forEach(ev => {
    const dateStr = new Date(ev.start).toISOString().split("T")[0];
    if (!eventMap[dateStr]) eventMap[dateStr] = [];
    eventMap[dateStr].push(ev.title);
  });

  Object.entries(userNotes || {}).forEach(([dateStr, note]) => {
    const date = new Date(dateStr);
    const noteDay = date.getDate();
    const noteMonth = date.getMonth();
    const currentMonth = viewStartDate.getMonth();
    if (noteMonth === currentMonth) {
      const offset = firstDayOfMonth.getDay(); // 0–6
      const index = noteDay + offset - 1;
      if (index >= 0 && index < 43) {
        if (!eventMap[dateStr]) eventMap[dateStr] = [];
        eventMap[dateStr].push(note);
      }
    }
  });

  // Assign merged values to `eventX` fields
  for (let i = 1; i <= 42; i++) {
    const dayValue = calendarData[`day${i}`];
    if (!dayValue) continue;

    const date = new Date(year, viewStartDate.getMonth(), dayValue);
    const dateStr = date.toISOString().split("T")[0];

    const combinedEvents = eventMap[dateStr];
    if (combinedEvents && combinedEvents.length > 0) {
      calendarData[`event${i - 1}`] = combinedEvents.join('\n');
    }
  }

  // Add required extra fields
  calendarData.bg_image = backgroundImage;
  calendarData.date = new Date(year, viewStartDate.getMonth() + 1, 0).toISOString().split('T')[0];

  return { calendarData, month, year };
}

const handleDownloadPdfClick = async () => {
  if (!window.ar_event_calendar_data) {
    console.warn("ar_event_calendar_data not available. Not able to download calendar.");
    return;
  }
  const { root_url } = window.ar_event_calendar_data;

  const calendarApi = calendarRef.current?.getApi();
  const { calendarData, month, year } = prepareCalendarData(
    calendarApi,
    events,
    userNotes,
    backgroundImage
  );

  const fileName = `calendar-${month}-${year}.pdf`;

  console.log("Calendar data prepared for download:", calendarData);

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
        const text = await res.text();
        errorMsg = text || errorMsg;
      }
      throw new Error(`PDF generation failed: ${errorMsg}`);
    }

    const rawBlob = await res.blob();
    const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
    saveAs(pdfBlob, fileName);
    console.log(`Download successful: ${fileName}`);
  } catch (err) {
    console.error("Download failed:", err.message);
  }
};

const handleDownloadWordClick = async () => {
  if (!window.ar_event_calendar_data) {
    console.warn("ar_event_calendar_data not available. Not able to download calendar.");
    return;
  }
  const { root_url } = window.ar_event_calendar_data;

  const calendarApi = calendarRef.current?.getApi();
  const { calendarData, month, year } = prepareCalendarData(
    calendarApi,
    events,
    userNotes,
    backgroundImage
  );

  const fileName = `calendar-${month}-${year}.docx`;

  console.log("Calendar data prepared for download:", calendarData);

  try {
    const res = await fetch(`${root_url}/wp-json/document_generator/v1/generateword`, {
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
        const text = await res.text();
        errorMsg = text || errorMsg;
      }
      throw new Error(`Word generation failed: ${errorMsg}`);
    }

    const rawBlob = await res.blob();
    const wordBlob = new Blob([rawBlob], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    saveAs(wordBlob, fileName);
    console.log(`Download successful: ${fileName}`);
  } catch (err) {
    console.error("Download failed:", err.message);
  }
};




// --- HANDLE CALENDAR DOWNLOAD ---
// const handleDownloadPdfClick = async () => {
//   if (!window.ar_event_calendar_data) {
//     console.warn("ar_event_calendar_data not available. Not able to download calendar.");
//     return;
//   }
//   const { root_url } = window.ar_event_calendar_data;

//   // const now = new Date();
//   // const month = now.toLocaleString('default', { month: 'long' });
//   // const year = now.getFullYear();

//   const calendarApi = calendarRef.current?.getApi();
//   const viewStartDate = new Date(calendarApi?.view?.currentStart);

//   const month = viewStartDate.toLocaleString('default', { month: 'long' });
//   const year = viewStartDate.getFullYear();

//   const fileName = `calendar-${month}-${year}.pdf`;

//   // Prepare data payload
//   const calendarData = {
//     month,
//     year,
//   };

//   // Initialize all required fields
//   for (let i = 0; i < 43; i++) {
//     if (i !== 42) {
//       calendarData[`day${i + 1}`] = '';   // 1-42
//     }
//     calendarData[`icon${i}`] = '';        // 0-42
//     calendarData[`event${i}`] = '';       // 0-42
//   }

//   // --- Set all `dayX` fields correctly ---
//   const firstDayOfMonth = new Date(year, viewStartDate.getMonth(), 1);
//   const lastDayOfMonth = new Date(year, viewStartDate.getMonth() + 1, 0);
//   const startIndex = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

//   let day = 1;
//   for (let i = startIndex; day <= lastDayOfMonth.getDate(); i++) {
//     calendarData[`day${i + 1}`] = day;
//     day++;
//   }

//   // Fill dynamic notes and events into the correct `eventX` index
//   const eventMap = {};
//   (events || []).forEach(ev => {
//     const dateStr = new Date(ev.start).toISOString().split("T")[0];
//     if (!eventMap[dateStr]) eventMap[dateStr] = [];
//     eventMap[dateStr].push(ev.title);
//   });

//   Object.entries(userNotes || {}).forEach(([dateStr, note]) => {
//     const date = new Date(dateStr);
//     const noteDay = date.getDate();
//     const noteMonth = date.getMonth();
//     const currentMonth = viewStartDate.getMonth();
//     if (noteMonth === currentMonth) {
//       const offset = firstDayOfMonth.getDay(); // 0–6
//       const index = noteDay + offset - 1;
//       if (index >= 0 && index < 43) {
//         if (!eventMap[dateStr]) eventMap[dateStr] = [];
//         eventMap[dateStr].push(note);
//       }
//     }
//   });

//   // Assign merged values to `eventX` fields
//   for (let i = 1; i <= 42; i++) {
//     const dayValue = calendarData[`day${i}`];
//     if (!dayValue) continue;

//     const date = new Date(year, viewStartDate.getMonth(), dayValue);
//     const dateStr = date.toISOString().split("T")[0];

//     const combinedEvents = eventMap[dateStr];
//     if (combinedEvents && combinedEvents.length > 0) {
//       calendarData[`event${i - 1}`] = combinedEvents.join('\n');
//     }
//   }

//   // Add required extra fields
//   calendarData.bg_image = backgroundImage;
//   calendarData.date = new Date(year, viewStartDate.getMonth() + 1, 0).toISOString().split('T')[0];

//   console.log("Calendar data prepared for download:", calendarData);

//   try {
//     const res = await fetch(`${root_url}/wp-json/document_generator/v1/generatepdf`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(calendarData)
//     });

//     if (!res.ok) {
//       let errorMsg = `HTTP ${res.status}`;
//       try {
//         const errorData = await res.json();
//         errorMsg = errorData.message || JSON.stringify(errorData);
//       } catch (jsonErr) {
//         const text = await res.text();
//         errorMsg = text || errorMsg;
//       }
//       throw new Error(`PDF generation failed: ${errorMsg}`);
//     }

//     const rawBlob = await res.blob();
//     const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
//     saveAs(pdfBlob, fileName);
//     console.log(`Download successful: ${fileName}`);
//   } catch (err) {
//     console.error("Download failed:", err.message);
//   }
// };




  return (
    <div className="top-bar">
      <button className='button-effect' onClick={handleChangeBgClick}>Change Background</button>
      <button className='button-effect'>Filter Activities</button>
      <button className='button-effect' onClick={handleDownloadPdfClick}>Download PDF</button>
      <button className='button-effect' onClick={handleDownloadWordClick}>Download Word</button>

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