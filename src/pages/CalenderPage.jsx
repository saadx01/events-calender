import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dummyEvents from '../data/dummyEvents';
import TopButtons from '../components/TopButtons';
import './CalendarPage.css';

export default function CalendarPage() {
  const [events, setEvents] = useState(dummyEvents);
  const [userNotes, setUserNotes] = useState({});

  const handleNoteChange = (dateStr, value) => {
    setUserNotes(prev => ({
      ...prev,
      [dateStr]: value
    }));
  };

  const saveNoteToDatabase = (dateStr, value) => {
    console.log(`Saved note for ${dateStr}:`, value);
    // TODO: Integrate with your backend here
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

  function getColor(category) {
    const colors = {
      business: 'blue',
      personal: 'green',
      creative: 'orange',
      user: 'purple'
    };
    return colors[category] || 'black';
  }


  const renderDayCellContent = (arg) => {
    const dateStr = arg.date.toISOString().split('T')[0];

    return (
      <div className="fc-day-inner-wrapper">
        <div className="fc-day-number">{arg.dayNumberText}</div>
        <textarea
          className="day-note"
          placeholder="Add text..."
          value={userNotes[dateStr] || ''}
          onChange={(e) => handleNoteChange(dateStr, e.target.value)}
          onBlur={(e) => saveNoteToDatabase(dateStr, e.target.value)}
        />
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
          headerToolbar={false}
        />
      </div>
    </div>
  );
}