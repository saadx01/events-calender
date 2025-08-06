// components/DownloadButtons.jsx
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

export default function DownloadButtons({
  userNotes,
  backgroundImage,
  calendarRef,
  visibleEvents,
  fontSize,
}) {
  const [previewHTML, setPreviewHTML] = useState('');
  const iframeRef = useRef();
  // console.log("Font size in DownloadButtons:", fontSize);

  function generateCalendarHTML(data) {
    const getDayNumber = (index) => data[`day${index}`] || "";
    const getEvent = (index) => data[`event${index}`] || "";

    // Count how many real days exist in data
    let totalDays = 0;
    for (let i = 1; i <= 42; i++) {
      if (getDayNumber(i) !== "") {
        totalDays++;
      }
    }

    // Find where the first day starts
    let firstDayIndex = -1;
    for (let i = 1; i <= 7; i++) {
      if (getDayNumber(i) !== "") {
        firstDayIndex = i - 1; // zero-based
        break;
      }
    }

    // Total cells needed = days + offset
    const totalCellsUsed = totalDays + firstDayIndex;

    // Calculate total rows needed
    const totalRows = Math.ceil(totalCellsUsed / 7);

    // Set td height accordingly
    const tdHeightStyle =
      totalRows === 6
        ? "height: calc(100% / 6) !important;"
        : "height: calc(100% / 5) !important;";


    const tableRows = [];
    for (let row = 0; row < totalRows; row++) {
      const tds = [];
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col + 1;
        const day = getDayNumber(index);
        const eventText = getEvent(index);
        const isOutside = day === "";
        const cellClasses = isOutside ? ' class="evc-outside"' : "";

        const dateHTML = `<div class="evc-date-number">${day}</div>`;
        let eventHTML = "";

        if (eventText.trim()) {
          const lines = eventText
            .split("\n")
            .map((line) => `<div class="evc-event">${line}</div>`)
            .join("");
          eventHTML = lines;
        }

        tds.push(
          `
          <td${cellClasses}>
            <div class="evc-cell-content">
              ${dateHTML}
              ${eventHTML}
            </div>
          </td>`.trim()
        );
      }
      tableRows.push(`<tr>${tds.join("\n")}</tr>`);
    }

return `
<!DOCTYPE html>
<html>
<head>
  <title>Calendar - ${data.month} ${data.year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    #evc-calendar {
      width: 1080px;
      height: 794px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin: auto;
      background-image: url('${data.bg_image}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding-bottom: 10px;
    }

    body {
      font-size: 18px;
    }

    #evc-calendar-table {
      font-size: 14px;
      font-family: "Roboto", sans-serif;
    }

    #evc-calendar-table {
      width: 100%;
      height: 100%;
      border-spacing: 5px;
      table-layout: fixed;
      flex: 1;
      box-sizing: border-box;
    }

    #evc-calendar th {
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      background-color: #7e57c2;
      color: white;
    }

    #evc-calendar-table td {
      text-align: left;
      padding: 10px;
      border-radius: 5px;
      position: relative;
      vertical-align: top;
      /*overflow: hidden;*/
      ${tdHeightStyle}
    }

    #evc-calendar-table td:not(.evc-outside) {
      background: linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(242, 242, 242, 1));
      color: #000;
    }

    #evc-calendar-table td.evc-outside {
      background-color: #f9f9f9;
      color: #aaa;
      opacity: 0.6;
    }

    .evc-date-number {
      position: absolute;
      top: 8px;
      right: 10px;
      font-weight: bold;
    }

    .evc-event {
      text-align: left;
      padding-left: 4px;
      padding-right: 4px;
      line-height: 1.2em !important;
      /*overflow: hidden;*/
      /*word-wrap: break-word;*/
      font-size: ${data.fontSize}px !important;
      height: auto !important;
    }

    .evc-cell-content {
      box-sizing: border-box;
      padding-top: 10px;
      overflow: hidden;
      height: 80px;
    }

    #evc-page-header {
      font-family: 'Lilita One', sans-serif;
      padding-top: 10px;
      padding-bottom: 10px;
      font-size: 18px;
    }

    #evc-month-year {
      background: white;
      border-radius: 50px;
    }

    #evc-month-year h2 {
      padding: 0;
      margin: 10px;
      color: #1C0D5A;
    }

    .evc-highlight {
      color: #f76a0c;
    }

  </style>
</head>
<body>
  <div id="evc-calendar">
    <table id="evc-page-header" style="width: 100%;">
      <tr>
        <td style="width: 25%"></td>
        <td id="evc-month-year" colspan="5" style="text-align: center"><h2>🗓 ${
          data.month
        } <span class="evc-highlight">${data.year}</span> Calendar</h2></td>
        <td style="text-align: right; width: 25%; padding-right: 30px;">
          <img class="evc-business-logo" src="https://downloads.memorylanetherapy.com/uploads/2023/05/cropped-MLT-LOGO-3.png" alt="Logo" width="150" />
        </td>
      </tr>
    </table>
    <table id="evc-calendar-table">
      <thead id="evc-calendar-header">
        <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
      </thead>
      <tbody>${tableRows.join("\n")}</tbody>
    </table>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const calendar = document.getElementById("evc-calendar");
      const allCells = document.querySelectorAll("#evc-calendar-table td");
      const calendarHeight = calendar.offsetHeight;
      const rows = document.querySelectorAll("#evc-calendar-table tr");
      const header = document.getElementById("evc-calendar-header");
      const headerHeight = header.offsetHeight || 0;
      const availableHeight = calendarHeight - headerHeight;
      const rowHeight = Math.floor(availableHeight / (rows.length + 1));

      allCells.forEach((cell) => {
        cell.style.height = rowHeight + "px";

        const content = cell.querySelector(".evc-cell-content");
        if (content) {
          cell.style.height = rowHeight + "px";
          content.style.overflow = "hidden";
        }
      });
    });
  </script>
</body>
</html>`;

  }

  function prepareCalendarData(
    calendarApi,
    visibleEvents,
    userNotes,
    backgroundImage
  ) {
    const viewStartDate = new Date(calendarApi?.view?.currentStart);
    const month = viewStartDate.toLocaleString("default", { month: "long" });
    const year = viewStartDate.getFullYear();
    const calendarData = { month, year };

    for (let i = 0; i < 43; i++) {
      if (i !== 42) calendarData[`day${i + 1}`] = "";
      calendarData[`icon${i}`] = "";
      calendarData[`event${i}`] = "";
    }

    const firstDayOfMonth = new Date(year, viewStartDate.getMonth(), 1);
    const lastDayOfMonth = new Date(year, viewStartDate.getMonth() + 1, 0);
    const startIndex = firstDayOfMonth.getDay();

    let day = 1;
    for (let i = startIndex; day <= lastDayOfMonth.getDate(); i++) {
      calendarData[`day${i + 1}`] = day++;
    }

    const eventMap = {};
    visibleEvents.forEach((ev) => {
      const dateStr = new Date(ev.start).toISOString().split("T")[0];
      if (!eventMap[dateStr]) eventMap[dateStr] = [];
      eventMap[dateStr].push(ev.title);
    });

    Object.entries(userNotes || {}).forEach(([dateStr, note]) => {
      const date = new Date(dateStr);
      if (date.getMonth() === viewStartDate.getMonth()) {
        if (!eventMap[dateStr]) eventMap[dateStr] = [];
        eventMap[dateStr].push(note);
      }
    });

    for (let d = 1; d <= lastDayOfMonth.getDate() + 1; d++) {
      const index = startIndex + (d - 1);
      const date = new Date(year, viewStartDate.getMonth(), d);
      const dateStr = date.toISOString().split("T")[0];
      const events = eventMap[dateStr];
      if (events?.length) calendarData[`event${index}`] = events.join("\n");
    }

    calendarData.bg_image = backgroundImage;
    calendarData.date = new Date(year, viewStartDate.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    calendarData.fontSize = fontSize;
    return { calendarData, month, year };
  }

  const handleDownloadPdfClick = () => {
    const calendarApi = calendarRef.current?.getApi();
    const { calendarData, month, year } = prepareCalendarData(
      calendarApi,
      visibleEvents,
      userNotes,
      backgroundImage
    );

    const html = generateCalendarHTML(calendarData);

    // Set preview HTML for iframe rendering
    setPreviewHTML(html);

    // Delay writing to iframe to ensure state is updated
    setTimeout(() => {
      if (iframeRef.current) {
        const doc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
      }
    }, 100);

    // Download PDF
    const opt = {
      margin: 0,
      filename: `calendar-${month}-${year}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      },
      jsPDF: {
        unit: "px",
        format: [1123, 794],
        // format: [1123, 900],
        orientation: "landscape",
      },
    };

    html2pdf().set(opt).from(html).save();
  };

  return (
    <div className="download-section">
      <p className="download-title">
        <strong>
          Download Your <mark className="highlight-orange">Calendar</mark>
        </strong>
      </p>
      <p className="download-subtitle">
        With our downloadable calendars, you can effortlessly plan your year,
        month, or week ahead.
      </p>
      <div className="download-buttons">
        <button
          className="download-button-pdf"
          onClick={handleDownloadPdfClick}
        >
          Download PDF
        </button>
      </div>

      {previewHTML && (
        <div style={{ marginTop: '30px', border: '2px solid #ccc' }}>
          <h3>Preview Calendar Below</h3>
          <iframe
            ref={iframeRef}
            title="Calendar Preview"
            style={{ width: '1123px', height: '794px', border: '1px solid black' }}
          />
        </div>
      )}
    </div>
  );
}
