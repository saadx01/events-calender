import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import TopButtons from '../components/TopButtons';
import DownloadButtons from '../components/DownloadButtons';
import './CalendarPage.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


Modal.setAppElement('#root');

export default function CalendarPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [userNotes, setUserNotes] = useState({});
  const [noteIdsMap, setNoteIdsMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalNote, setModalNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const calendarRef = useRef(null);

  const [activities, setActivities] = useState([]);
  const [calendarCustomEvents, setCalendarCustomEvents] = useState([]);
  const [visibleFilters, setVisibleFilters] = useState({ monthly: true });
  const [visibleEvents, setVisibleEvents] = useState([]); // This will be the array you pass to FullCalendar
  const [categoryColors, setCategoryColors] = useState({});

  const [fontSize, setFontSize] = useState(12);




  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // const res = await axios.get('https://newstaging.memorylanetherapy.com/wp-json/activities/v1/search', {

        const res = await axios.get(`${ar_event_calendar_data.root_url}/wp-json/activities/v1/search`, {
          withCredentials: true
        });

        // const res = {
        //   data: {
        //     activities: [
        //       {
        //         id: 524,
        //         name: "Australia Day",
        //         link: "https://newstaging.memorylanetherapy.com/calendar-for-aged-care/january/australia-day/",
        //         date: "20230926",
        //         color: "#6E5AE2",
        //         hover_color: "#6E5AE2"
        //       },
        //       {
        //         id: 534,
        //         name: "Betty White's birthday",
        //         link: "https://newstaging.memorylanetherapy.com/calendar-for-aged-care/january/betty-whites-birthday/",
        //         date: "20230117",
        //         color: "#6E5AE2",
        //         hover_color: "#6E5AE2"
        //       },
        //       {
        //         id: 522,
        //         name: "Elvis Presley's Birthday",
        //         link: "https://newstaging.memorylanetherapy.com/calendar-for-aged-care/january/elvis-presleys-birthday/",
        //         date: "20230918",
        //         color: "#6E5AE2",
        //         hover_color: "#6E5AE2"
        //       },
        //       {
        //         id: 601,
        //         name: "World Chocolate Day",
        //         link: "https://newstaging.memorylanetherapy.com/calendar/july/world-chocolate-day/",
        //         date: "20250707", // 🔥 Current July
        //         color: "#6E5AE2",
        //         hover_color: "#6E5AE2"
        //       },
        //       {
        //         id: 602,
        //         name: "Picnic Day",
        //         link: "https://newstaging.memorylanetherapy.com/calendar/july/picnic-day/",
        //         date: "20250710", // 🔥 Current July
        //         color: "#6E5AE2",
        //         hover_color: "#6E5AE2"
        //       },
        //                     {
        //         id: 603,
        //         name: "Enjoyment Day",
        //         link: "https://newstaging.memorylanetherapy.com/calendar/july/picnic-day/",
        //         date: "20250712", // 🔥 Current July
        //         color: "#6E5AE3",
        //         hover_color: "#6E5AE2"
        //       }
        //     ],
        //     calendar_custom_events: [
        //       {
        //         id: 24471,
        //         title: "Pakistan’s Independence Day",
        //         author: "Up Work",
        //         date: "2023/07/14",
        //         type: "calendar-events",
        //         category: "reminders",
        //         color: "#7bb591"
        //       },
        //       {
        //         id: 24472,
        //         title: "Team Outing",
        //         author: "Admin",
        //         date: "2025/07/15", // 🔥 Current July
        //         type: "calendar-events",
        //         category: "celebration",
        //         color: "#FF9800"
        //       },
        //       {
        //         id: 24473,
        //         title: "Music Therapy Session",
        //         author: "Admin",
        //         date: "2025/07/20", // 🔥 Current July
        //         type: "calendar-events",
        //         category: "reminders",
        //         color: "#7bb591"
        //       },
        //                     {
        //         id: 24473,
        //         title: "Weekly Reflection",
        //         author: "Admin",
        //         date: "2025/07/31", // 🔥 Current July
        //         type: "calendar-events",
        //         category: "reminders",
        //         color: "#7bb591"
        //       }
        //     ],
        //     member_events: [
        //       {
        //         id: 36250,
        //         title: "Auto Draft",
        //         author: "Up Work",
        //         date: null,
        //         type: "member-events",
        //         color: "#FF7276"
        //       },
        //       {
        //         id: 36249,
        //         title: "Auto Draft",
        //         author: "Up Work",
        //         date: null,
        //         type: "member-events",
        //         color: "#FF7276"
        //       },
        //       {
        //         id: 36091,
        //         title: "how",
        //         author: "Up Work",
        //         date: "2025/05/06",
        //         type: "member-events",
        //         color: "#FF7276"
        //       },
        //       {
        //         id: 36090,
        //         title: "Daily Journal",
        //         author: "Up Work",
        //         date: "2025/07/03", // 🔥 Current July
        //         type: "member-events",
        //         color: "#FF7276"
        //       },
        //       {
        //         id: 36089,
        //         title: "Reminder: Call Family",
        //         author: "Up Work",
        //         date: "2025/07/05", // 🔥 Current July
        //         type: "member-events",
        //         color: "#FF7276"
        //       },
        //       {
        //         id: 36088,
        //         title: "Write Poem",
        //         author: "Up Work",
        //         date: "2025/07/10", // 🔥 Current July
        //         type: "member-events",
        //         color: "#FF7276"
        //       }
        //     ],
        //     calendar_default_icon_url: "https://newstaging.memorylanetherapy.com/downloads/uploads/woocommerce-placeholder.png",
        //     calendar_icons: [
        //       {
        //         id: 36092,
        //         author: "Up Work",
        //         date: "2025/05/01",
        //         type: "calendar-icon",
        //         link: ""
        //       },
        //       {
        //         id: 28473,
        //         author: "Up Work",
        //         date: "2024/03/06",
        //         type: "calendar-icon",
        //         link: "https://newstaging.memorylanetherapy.com/wp-content/Event-calendar-uploads/Elegant-QA-Live-Session-Instagram-Post-17.png"
        //       },
        //       {
        //         id: 28471,
        //         author: "Up Work",
        //         date: "2024/03/07",
        //         type: "calendar-icon",
        //         link: "https://newstaging.memorylanetherapy.com/wp-content/Event-calendar-uploads/Default-Calendar-Background-2.jpg"
        //       }
        //     ],
        //     calendar_bg: "https://newstaging.memorylanetherapy.com/wp-content/uploads/2023/11/Default-Calendar-Background.jpg"
        //   }
        // };



        const formatDate = (str) => {
          if (!str) return null;
          return str.includes('/')
            ? str.replace(/\//g, '-')
            : `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        };

        // const allEvents = [];
        const fetchedActivities = [];
        const fetchedCalendarCustomEvents = [];

        const notesMap = {};
        const idsMap = {};

        // console.log('Fetched calendar data:', res.data);

        res.data.activities?.forEach(ev => {
          fetchedActivities.push({
            title: ev.name,
            start: formatDate(ev.date),
            url: ev.link,
            color: ev.color,
            category: 'activity'
          });
        });

        res.data.calendar_custom_events?.forEach(ev => {
          fetchedCalendarCustomEvents.push({
            title: ev.title,
            start: formatDate(ev.date),
            color: ev.color || '#7bb591',
            category: ev.category || 'custom'
          });
        });

        res.data.member_events?.forEach(ev => {
          const date = formatDate(ev.date);
          if (date) {
            notesMap[date] = ev.title || '';
            idsMap[date] = ev.id;
          }
        });

        // console.log("Fetched activities and custom events:", fetchedActivities, fetchedCalendarCustomEvents)
        setActivities(fetchedActivities);
        setCalendarCustomEvents(fetchedCalendarCustomEvents);
        setAllEvents([...fetchedActivities, ...fetchedCalendarCustomEvents]);

        // Build default visible filters dynamically
        const initialFilters = { monthly: true };
        fetchedCalendarCustomEvents.forEach(ev => {
          if (ev.category) {
            initialFilters[ev.category] = true;
          }
        });
        setVisibleFilters(initialFilters);

        const colorMap = {
          monthly: fetchedActivities[0]?.color || '#6E5AE2' // Fallback
        };

        fetchedCalendarCustomEvents.forEach(ev => {
          if (ev.category && ev.color && !colorMap[ev.category]) {
            colorMap[ev.category] = ev.color;
          }
        });

        setCategoryColors(colorMap);


        setUserNotes(notesMap);
        setNoteIdsMap(idsMap);

        // Extract and set calendar background image
        if (res.data.calendar_bg) {
          setBackgroundImage(res.data.calendar_bg);
        }

      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    fetchCalendarData();
  }, []);

  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    setSelectedDate(dateStr);
    setModalNote(userNotes?.[dateStr] || '');
    setIsModalOpen(true);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);

    const hasExistingNote = Boolean(noteIdsMap[selectedDate]);
    const trimmedNote = modalNote.trim();
    const isNoteEmpty = trimmedNote === '';

    const isNewNote = !hasExistingNote && !isNoteEmpty;
    const isUpdated = hasExistingNote && !isNoteEmpty;
    const isDeleted = hasExistingNote && isNoteEmpty;

    // console.log('isNewNote:', isNewNote);
    // console.log('isUpdated:', isUpdated);
    // console.log('isDeleted:', isDeleted);

    try {
      const result = await saveNoteToBackend(selectedDate, trimmedNote, noteIdsMap[selectedDate]);

      setUserNotes(prev => ({
        ...prev,
        [selectedDate]: trimmedNote
      }));

      if (isDeleted) {
        const updatedMap = { ...userNotes };
        delete updatedMap[selectedDate];
        setUserNotes(updatedMap);
        setNoteIdsMap(prev => {
          const copy = { ...prev };
          delete copy[selectedDate];
          return copy;
        });
        // console.log('Note deleted:', selectedDate);
        toast.success('Note deleted successfully!');
      } else if (isNewNote) {
        if (result?.id) {
          setNoteIdsMap(prev => ({
            ...prev,
            [selectedDate]: result.id
          }));
        }
        // console.log('Note added:', selectedDate);
        toast.success('Note added successfully!');
      } else if (isUpdated) {
        // console.log('Note updated:', selectedDate);
        toast.success('Note updated successfully!');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user note:', error);
      toast.error('Failed to save the note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const saveNoteToBackend = async (date, value, noteId = null) => {
    if (!window.ar_event_calendar_data) {
      console.warn("ar_event_calendar_data not available. Unable to save note to backend.");
      return;
    }

    const { rest_nonce, root_url } = window.ar_event_calendar_data;
    const headers = {
      "Content-Type": "application/json",
      "X-WP-Nonce": rest_nonce
    };

    if (value.trim() === '' && noteId) {
      // DELETE (empty string = deletion)
      const url = `${root_url}/wp-json/wp/v2/member-events/${noteId}`;
      const body = JSON.stringify({ title: '' });

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      if (!res.ok) throw new Error("Delete failed");
      return { id: null };
    }

    const body = JSON.stringify({
      acf: { member_event_date: date },
      title: value,
      status: "publish"
    });

    // Update & Delete (If noteId exists, it will update; if value is empty, it will delete)
    const url = noteId
      ? `${root_url}/wp-json/wp/v2/member-events/${noteId}`
      : `${root_url}/wp-json/wp/v2/member-events/`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body
    });

    if (!res.ok) throw new Error("Save failed");

    const result = await res.json();
    return result;
  };

  const renderEventContent = (eventInfo) => {
    const category = eventInfo.event.extendedProps.category;
    const color = getColor(category);
    if (category === 'user') return null;
    return <div style={{ color }} className="fc-event-custom">{eventInfo.event.title}</div>;
  };

  const renderDayCellContent = (arg) => {
    const dateStr = arg.date.toLocaleDateString('en-CA');
    return (
      <div className="fc-day-inner-wrapper">
        <div className="fc-day-number">{arg.dayNumberText}</div>
        {userNotes[dateStr]
          ? <div className="day-note-preview">{userNotes[dateStr]}</div>
          : <div className="day-note-instruction">Add Text...</div>}
      </div>
    );
  };

  // Changing background image
  const applyBackgroundToCalendar = (imageUrl) => {
    const calendarEl = document.querySelector(".fc");
    if (calendarEl) {
      calendarEl.style.backgroundImage = `url("${imageUrl}")`;
    }
  };

  useEffect(() => {
    if (backgroundImage) {
      applyBackgroundToCalendar(backgroundImage);
    }
  }, [backgroundImage]);

  useEffect(() => {
    document.documentElement.style.setProperty("--event-font-size", `${fontSize}px`);
  }, [fontSize]);


  return (
    <div className="app-wrapper">
      <TopButtons
        setBackgroundImage={(url) => setBackgroundImage(url)}
        activities={activities}
        calendarCustomEvents={calendarCustomEvents}
        visibleFilters={visibleFilters}
        setVisibleFilters={setVisibleFilters}
        setVisibleEvents={setVisibleEvents}
        categoryColors={categoryColors}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={visibleEvents}
          eventContent={renderEventContent}
          dayCellContent={renderDayCellContent}
          headerToolbar={{
            start: 'title',
            center: '',
            end: 'today prev,next'
          }}
          dateClick={handleDateClick}
          ref={calendarRef}
        />
      </div>

      <DownloadButtons
        userNotes={userNotes}
        backgroundImage={backgroundImage}
        calendarRef={calendarRef}
        visibleEvents={visibleEvents} />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="note-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal_heading">
          <h5 className="modal-title">📃 Add Note here</h5>
          <p className="note-modal-date">
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : ''}
          </p>
        </div>

        <textarea
          rows={6}
          value={modalNote}
          onChange={(e) => setModalNote(e.target.value)}
        />
        <div className="modal-buttons">
          <button className='save-btn' onClick={handleSaveNote} disabled={isSaving}>
            {isSaving ? <span className="loader"></span> : 'Save'}
          </button>
          <button className='cancel-btn' onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </button>
        </div>

      </Modal>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}

function getColor(category) {
  const colors = {
    business: 'blue',
    personal: 'green',
    creative: 'orange',
    user: 'purple'
  };
  return colors[category] || 'black';
}
