// components/DownloadButtons.jsx
import { saveAs } from 'file-saver';

export default function DownloadButtons({ userNotes, backgroundImage, calendarRef, visibleEvents }) {


    function prepareCalendarData(calendarApi, visibleEvents, userNotes, backgroundImage) {
    const viewStartDate = new Date(calendarApi?.view?.currentStart);

    const month = viewStartDate.toLocaleString('default', { month: 'long' });
    const year = viewStartDate.getFullYear();

    const calendarData = {
        month,
        year,
    };

    for (let i = 0; i < 43; i++) {
        if (i !== 42) {
        calendarData[`day${i + 1}`] = '';
        }
        calendarData[`icon${i}`] = '';
        calendarData[`event${i}`] = '';
    }

    const firstDayOfMonth = new Date(year, viewStartDate.getMonth(), 1);
    const lastDayOfMonth = new Date(year, viewStartDate.getMonth() + 1, 0);
    const startIndex = firstDayOfMonth.getDay();

    let day = 1;
    for (let i = startIndex; day <= lastDayOfMonth.getDate(); i++) {
        calendarData[`day${i + 1}`] = day;
        day++;
    }

    const eventMap = {};
    (visibleEvents || []).forEach(ev => {
        const dateStr = new Date(ev.start).toISOString().split("T")[0];
        if (!eventMap[dateStr]) eventMap[dateStr] = [];
        eventMap[dateStr].push(ev.title);
    });

    Object.entries(userNotes || {}).forEach(([dateStr, note]) => {
        const date = new Date(dateStr);
        const noteMonth = date.getMonth();
        const currentMonth = viewStartDate.getMonth();
        if (noteMonth === currentMonth) {
        if (!eventMap[dateStr]) eventMap[dateStr] = [];
        eventMap[dateStr].push(note);
        }
    });
    // console.log("Event map:", eventMap);

    for (let day = 1; day <= lastDayOfMonth.getDate()+1; day++) {
        const index = startIndex + (day - 1);
        const date = new Date(year, viewStartDate.getMonth(), day);
        const dateStr = date.toISOString().split("T")[0];

        const combinedEvents = eventMap[dateStr];
        // console.log("Combined events for date:", dateStr, combinedEvents);
        if (combinedEvents && combinedEvents.length > 0) {
        // console.log(`Assigning to event${index + 1}:`, combinedEvents);
        calendarData[`event${index}`] = combinedEvents.join('\n');
        }
    }

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
            visibleEvents,
            userNotes,
            backgroundImage
        );

        const fileName = `calendar-${month}-${year}.pdf`;

        // console.log("Calendar data prepared for download:", calendarData);

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
            // console.log(`Download successful: ${fileName}`);
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
            visibleEvents,
            userNotes,
            backgroundImage
        );

        const fileName = `calendar-${month}-${year}.docx`;

        // console.log("Calendar data prepared for download:", calendarData);

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
            // console.log(`Download successful: ${fileName}`);
        } catch (err) {
            console.error("Download failed:", err.message);
        }
    };

    return (
        <div className="download-section">
            <p className="download-title">
                <strong>
                    Download Your <mark className="highlight-orange">Calendar</mark>
                </strong>
            </p>
            <p className="download-subtitle">
                With our downloadable calendars, you can effortlessly plan your year, month, or week ahead.
            </p>
            <div className="download-buttons">
                <button className="download-button-pdf" onClick={handleDownloadPdfClick}>
                    Download PDF
                </button>
                <button className="download-button-word" onClick={handleDownloadWordClick}>
                    Download Word
                </button>
            </div>
        </div>
    );
}
