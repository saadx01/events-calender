import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
// import dummyEvents from '../data/dummyEvents';
import TopButtons from '../components/TopButtons';
import './CalendarPage.css';
import axios from 'axios';

Modal.setAppElement('#root');

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [userNotes, setUserNotes] = useState({});
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

      // General activities
      res.data.activities?.forEach(ev => {
        allEvents.push({
          title: ev.name,
          start: formatDate(ev.date),
          url: ev.link,
          color: ev.color,
          category: 'activity'
        });
      });

      // Custom calendar events
      res.data.calendar_custom_events?.forEach(ev => {
        allEvents.push({
          title: ev.title,
          start: formatDate(ev.date),
          color: ev.color || '#7bb591',
          category: ev.category || 'custom'
        });
      });

      // Member notes → store in userNotes state
      res.data.member_events?.forEach(ev => {
        const date = formatDate(ev.date);
        if (date) {
          notesMap[date] = ev.title || ''; // Save note content by date
        }
      });

      setEvents(allEvents);
      setUserNotes(notesMap);

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

  const handleSaveNote = () => {
    setUserNotes(prev => ({
      ...prev,
      [selectedDate]: modalNote
    }));
    setIsModalOpen(false);
    console.log(`Saved note for ${selectedDate}: ${modalNote}`);
    // TODO: save to backend
  };

  const renderEventContent = (eventInfo) => {
    const category = eventInfo.event.extendedProps.category;
    const color = getColor(category);
    if (category === 'user') return null;

    return (
      <div style={{ color }} className="fc-event-custom">
        {eventInfo.event.title}
      </div>
    );
  };

  const renderDayCellContent = (arg) => {
    const dateStr = arg.date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return (
      <div className="fc-day-inner-wrapper">
        <div className="fc-day-number">{arg.dayNumberText}</div>
        {userNotes[dateStr] ?
          <div className="day-note-preview">{userNotes[dateStr]}</div>
          :
          <div className="day-note-instruction">Add Text...</div>
        }
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
          headerToolbar={
            {
              start: 'title', // will normally be on the left. if RTL, will be on the right
              center: '',
              end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
            }
          }
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
