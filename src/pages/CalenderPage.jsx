import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import TopButtons from '../components/TopButtons';
import './CalendarPage.css';
import axios from 'axios';

Modal.setAppElement('#root');

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [userNotes, setUserNotes] = useState({});
  const [noteIdsMap, setNoteIdsMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalNote, setModalNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const res = await axios.get('https://newstaging.memorylanetherapy.com/wp-json/activities/v1/search', {
          withCredentials: true
        });

        const formatDate = (str) => {
          if (!str) return null;
          return str.includes('/')
            ? str.replace(/\//g, '-')
            : `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        };

        const allEvents = [];
        const notesMap = {};
        const idsMap = {};

        res.data.activities?.forEach(ev => {
          allEvents.push({
            title: ev.name,
            start: formatDate(ev.date),
            url: ev.link,
            color: ev.color,
            category: 'activity'
          });
        });

        res.data.calendar_custom_events?.forEach(ev => {
          allEvents.push({
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

        setEvents(allEvents);
        setUserNotes(notesMap);
        setNoteIdsMap(idsMap);

      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    fetchCalendarData();
  }, []);

  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    setSelectedDate(dateStr);
    setModalNote(userNotes[dateStr] || '');
    setIsModalOpen(true);
  };

  const handleSaveNote = async () => {
    try {
      const result = await saveNoteToBackend(selectedDate, modalNote, noteIdsMap[selectedDate]);

      setUserNotes(prev => ({
        ...prev,
        [selectedDate]: modalNote
      }));

      if (modalNote.trim() === '') {
        const updatedMap = { ...userNotes };
        delete updatedMap[selectedDate];
        setUserNotes(updatedMap);
        setNoteIdsMap(prev => {
          const copy = { ...prev };
          delete copy[selectedDate];
          return copy;
        });
      } else if (result?.id) {
        setNoteIdsMap(prev => ({
          ...prev,
          [selectedDate]: result.id
        }));
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user note:', error);
    }
  };

  const saveNoteToBackend = async (date, value, noteId = null) => {
    if (!window.ar_event_calendar_data) {
      console.warn("ar_event_calendar_data not available");
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

  return (
    <div className="app-wrapper">
      <TopButtons />
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          dayCellContent={renderDayCellContent}
          headerToolbar={{
            start: 'title',
            center: '',
            end: 'today prev,next'
          }}
          dateClick={handleDateClick}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="note-modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="modal-title">Note - {selectedDate}</h2>
        <textarea
          rows={6}
          value={modalNote}
          onChange={(e) => setModalNote(e.target.value)}
        />
        <div className="modal-buttons">
          <button className='save-btn' onClick={handleSaveNote}>Save</button>
          <button className='cancel-btn' onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
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
