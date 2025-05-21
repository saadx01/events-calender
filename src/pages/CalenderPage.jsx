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

  function renderEventContent(eventInfo) {
    return (
      <div style={{ color: getColor(eventInfo.event.extendedProps.category) }}>
        {eventInfo.event.title}
      </div>
    );
  }

  function getColor(category) {
    const colors = {
      business: 'blue',
      personal: 'green',
      creative: 'orange',
    };
    return colors[category] || 'black';
  }

  return (
    <div className="app-wrapper">
      <TopButtons />
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          headerToolbar={
            {
              start: 'today prev,next', // will normally be on the left. if RTL, will be on the right
              center: 'title',
              end: 'dayGridMonth dayGridWeek' // will normally be on the right. if RTL, will be on the left
            }
          }
          // headerToolbar={false} // we use custom buttons
          // height={'100vh'}
        />
      </div>
    </div>
      
  );
}