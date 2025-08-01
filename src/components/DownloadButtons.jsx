// components/DownloadButtons.jsx
import html2pdf from 'html2pdf.js';

export default function DownloadButtons({ userNotes, backgroundImage, calendarRef, visibleEvents }) {

  function generateCalendarHTML(data) {
    const getDayNumber = (index) => data[`day${index}`] || '';
    const getEvent = (index) => data[`event${index}`] || '';

    const tableRows = [];
    for (let row = 0; row < 6; row++) {
      const tds = [];
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col + 1;
        const day = getDayNumber(index);
        const eventText = getEvent(index);
        const isOutside = day === '';
        const cellClasses = isOutside ? ' class="outside"' : '';

        const dateHTML = `<div class="date-number">${day}</div>`;
        let eventHTML = '';

        if (eventText.trim()) {
          const lines = eventText
            .split('\n')
            .map(line => `<div class="event">${line}</div>`)
            .join('');
          eventHTML = lines;
        }

        tds.push(`
          <td${cellClasses}>
            <div class="cell-content">
              ${dateHTML}
              ${eventHTML}
            </div>
          </td>`.trim());
      }
      tableRows.push(`<tr>${tds.join('\n')}</tr>`);
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Calendar - ${data.month} ${data.year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Roboto:wght@400;700&display=swap');
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
    @page { size: A4 landscape; margin: 0; }
    #calendar {
      width: 1080px; height: 794px;
      margin: auto;
      background-image: url('${data.bg_image}');
      background-size: cover;
      background-position: center;
      font-family: 'Roboto', sans-serif;
    }
    #calendar-table {
      width: 100%; height: 100%;
      border-spacing: 5px;
      table-layout: fixed;
      flex: 1;
    }
    #calendar th {
      text-align: center; padding: 10px;
      border-radius: 5px;
      background-color: #7e57c2; color: white;
    }
    #calendar-table td {
      text-align: left;
      padding: 10px;
      border-radius: 5px;
      vertical-align: top;
      height: calc(100% / 6);
    }
    #calendar-table td:not(.outside) {
      background: linear-gradient(to bottom right, #fff, #f2f2f2);
      color: #000;
    }
    #calendar-table td.outside {
      background-color: #f9f9f9;
      color: #aaa;
      opacity: 0.6;
    }
    .date-number {
      position: absolute;
      top: 2px;
      right: 2px;
      font-weight: bold;
      font-size: 14px;
    }
    .event {
      padding: 2px 4px;
      font-size: ${data.fontSize};
      margin-top: 6px;
    }
    .cell-content {
      position: relative;
      box-sizing: border-box;
      padding-top: 10px;
    }
    #page-header {
      font-family: 'Lilita One', cursive;
      text-align: center;
      padding: 10px;
    }
    #month-year {
      background: white;
      border-radius: 50px;
    }
    #month-year h2 {
      margin: 10px;
      color: #1C0D5A;
    }
    .highlight {
      color: #f76a0c;
    }
  </style>
</head>
<body>
  <div id="calendar">
    <table id="page-header" style="width: 100%;">
      <tr>
        <td style="width: 25%"></td>
        <td id="month-year" colspan="5"><h2>🗓 ${data.month} <span class="highlight">${data.year}</span> Calendar</h2></td>
        <td style="text-align: right; padding-right: 30px;">
          <img src="https://downloads.memorylanetherapy.com/uploads/2023/05/cropped-MLT-LOGO-3.png" width="150" />
        </td>
      </tr>
    </table>
    <table id="calendar-table">
      <thead id="calendar-header">
        <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
      </thead>
      <tbody>${tableRows.join('\n')}</tbody>
    </table>
  </div>
</body>
</html>`;
  }

  function prepareCalendarData(calendarApi, visibleEvents, userNotes, backgroundImage) {
    const viewStartDate = new Date(calendarApi?.view?.currentStart);
    const month = viewStartDate.toLocaleString('default', { month: 'long' });
    const year = viewStartDate.getFullYear();
    const calendarData = { month, year };

    for (let i = 0; i < 43; i++) {
      if (i !== 42) calendarData[`day${i + 1}`] = '';
      calendarData[`icon${i}`] = '';
      calendarData[`event${i}`] = '';
    }

    const firstDayOfMonth = new Date(year, viewStartDate.getMonth(), 1);
    const lastDayOfMonth = new Date(year, viewStartDate.getMonth() + 1, 0);
    const startIndex = firstDayOfMonth.getDay();

    let day = 1;
    for (let i = startIndex; day <= lastDayOfMonth.getDate(); i++) {
      calendarData[`day${i + 1}`] = day++;
    }

    const eventMap = {};
    visibleEvents.forEach(ev => {
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

    for (let d = 1; d <= lastDayOfMonth.getDate()+1; d++) {
      const index = startIndex + (d - 1);
      const date = new Date(year, viewStartDate.getMonth(), d);
      const dateStr = date.toISOString().split("T")[0];
      const events = eventMap[dateStr];
      if (events?.length) calendarData[`event${index}`] = events.join('\n');
    }

    calendarData.bg_image = backgroundImage;
    calendarData.date = new Date(year, viewStartDate.getMonth() + 1, 0).toISOString().split('T')[0];
    calendarData.fontSize = '14px'; // Default, or make dynamic
    return { calendarData, month, year };
  }

  const handleDownloadPdfClick = () => {
    const calendarApi = calendarRef.current?.getApi();
    const { calendarData, month, year } = prepareCalendarData(calendarApi, visibleEvents, userNotes, backgroundImage);

    const html = generateCalendarHTML(calendarData);

    const opt = {
      margin: 0,
      filename: `calendar-${month}-${year}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      },
      jsPDF: {
        unit: 'px',
        format: [1123, 794], // A4 landscape
        orientation: 'landscape'
      }
    };

    html2pdf().set(opt).from(html).save();
  };

  const handleDownloadWordClick = async () => {
    // Keep your original Word download logic here
  };

  return (
    <div className="download-section">
      <p className="download-title">
        <strong>Download Your <mark className="highlight-orange">Calendar</mark></strong>
      </p>
      <p className="download-subtitle">
        With our downloadable calendars, you can effortlessly plan your year, month, or week ahead.
      </p>
      <div className="download-buttons">
        <button className="download-button-pdf" onClick={handleDownloadPdfClick}>Download PDF</button>
        {/* <button className="download-button-word" onClick={handleDownloadWordClick}>Download Word</button> */}
      </div>
    </div>
  );
}