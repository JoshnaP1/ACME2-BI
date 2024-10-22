import React, { useState, useEffect } from 'react';
import { getEvents, updateEvent, deleteEvent, createEvent } from '../services/eventService';
import { Link } from 'react-router-dom';
import '../styles/EventInventory.css'; // Custom styles for the homepage
import logo from '../assets/InnerVentory Button.png'; // Placeholder for your logo
import logo2 from '../assets/BreastIntentionsLogo.png'; // Placeholder for your logo

const EventInventory = () => {
    const [events, setEvents] = useState([]);
    const [editEventId, setEditEventId] = useState(null);
    const [editAttendeeId, setEditAttendeeId] = useState({ eventIndex: null, attendeeIndex: null });
    const [eventFormData, setEventFormData] = useState({ name: '', date: '' });
    const [attendeeFormData, setAttendeeFormData] = useState({ 
        name: '', 
        sizeBefore: '', 
        sizeAfter: '', 
        fitterName: '', 
        phoneNumber: '', 
        email: '' 
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchByEvent, setSearchByEvent] = useState(false);
    const [searchByAttendee, setSearchByAttendee] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const eventData = await getEvents();
            setEvents(eventData || []);
        };

        fetchEvents();
    }, []);

    const handleEventInputChange = (e) => {
        const { name, value } = e.target;
        setEventFormData({ ...eventFormData, [name]: value });
    };

    const handleCreateEvent = async () => {
        // Check if both name and date fields are provided
        if (!eventFormData.name || !eventFormData.date) {
            setErrorMessage('Event name and date are required.');
            return;
        }
    
        // If validation passes, create the event
        await createEvent(eventFormData);
        setEventFormData({ name: '', date: '' });
        const updatedEvents = await getEvents();
        setEvents(updatedEvents);
        setSuccessMessage('Event created successfully');
        setErrorMessage('');
    };

    const handleEditEvent = (eventId, event) => {
        setEditEventId(eventId);
        setEventFormData({ name: event?.name || '', date: event?.date.split('T')[0] || '' });
    };

    const handleDeleteEvent = async (eventId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this event?");
        if (isConfirmed) {
            await deleteEvent(eventId);
            const updatedEvents = await getEvents();
            setEvents(updatedEvents);
            setSuccessMessage('Event deleted successfully');
        }
    };
    

    const handleAttendeeInputChange = (e) => {
        const { name, value } = e.target;
        setAttendeeFormData({ ...attendeeFormData, [name]: value });
    };

        const handleAddAttendee = async (eventIndex) => {
        const updatedEvents = [...events];
        updatedEvents[eventIndex].attendees.push(attendeeFormData);
        await updateEvent(updatedEvents[eventIndex]._id, updatedEvents[eventIndex]);
        setAttendeeFormData({ 
            name: '', 
            sizeBefore: '', 
            sizeAfter: '', 
            fitterName: '', 
            phoneNumber: '', 
            email: '' 
        });
        setEvents(updatedEvents);
        setSuccessMessage('Attendee added successfully');
    };

    const handleEditAttendee = (eventIndex, attendeeIndex, attendee) => {
        setEditAttendeeId({ eventIndex, attendeeIndex });
        setAttendeeFormData({ 
            name: attendee?.name || '', 
            sizeBefore: attendee?.sizeBefore || '', 
            sizeAfter: attendee?.sizeAfter || '',
            fitterName: attendee?.fitterName || '',
            phoneNumber: attendee?.phoneNumber || '',
            email: attendee?.email || ''
        });
    };

    const handleUpdateEvent = async () => {
        await updateEvent(editEventId, eventFormData);
        setEditEventId(null);
        setEventFormData({ name: '', date: '' });
        const updatedEvents = await getEvents();
        setEvents(updatedEvents);
        setSuccessMessage('Event updated successfully');
    };

    const handleUpdateAttendee = async () => {
        const { eventIndex, attendeeIndex } = editAttendeeId;
        const updatedEvents = [...events];
        updatedEvents[eventIndex].attendees[attendeeIndex] = attendeeFormData;
        await updateEvent(updatedEvents[eventIndex]._id, updatedEvents[eventIndex]);
        setEditAttendeeId({ eventIndex: null, attendeeIndex: null });
        setAttendeeFormData({ 
            name: '', 
            sizeBefore: '', 
            sizeAfter: '', 
            fitterName: '', 
            phoneNumber: '', 
            email: '' 
        });
        setEvents(updatedEvents);
        setSuccessMessage('Attendee updated successfully');
    };

    const handleDeleteAttendee = async (eventIndex, attendeeIndex) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this attendee?");
        if (isConfirmed) {
            const updatedEvents = [...events];
            updatedEvents[eventIndex].attendees.splice(attendeeIndex, 1);
            await updateEvent(updatedEvents[eventIndex]._id, updatedEvents[eventIndex]);
            setEvents(updatedEvents);
            setSuccessMessage('Attendee deleted successfully');
        }
    };    
    
    // Search events and attendees
    const filteredEvents = events.map(event => {
        const eventMatches = searchByEvent && event.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter attendees based on the search term
        const filteredAttendees = searchByAttendee
            ? event.attendees.filter(attendee =>
                attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : event.attendees;

        // Determine if the event should be visible
        const isVisible = eventMatches || (searchByAttendee && filteredAttendees.length > 0);

        return {
            ...event,
            attendees: isVisible ? filteredAttendees : event.attendees,
            isVisible
        };
    }).filter(event => event.isVisible || (!searchTerm && !searchByEvent && !searchByAttendee));

    return (
        <div className='app'>
            <header className="EventInventory-header">
                <div className="logo-container">
                    <img src={logo} alt="Breast Intentions Logo" className="logo" />
                    <img src={logo2} alt="Breast Intentions Logo" className="logo" />
                </div>
                <nav className="navbar">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/bra-inventory" className="nav-link">Bra Inventory</Link>
                    <Link to="/event-inventory" className="nav-link">Event Inventory</Link>
                </nav>
            </header>

            <div className="main-content">
                <h1 className='event-inventory-title'>Welcome to the Event Inventory</h1>
                <div className="search-section">
                    <input
                        type="text"
                        className='search-input'
                        placeholder="Search events or attendees"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                        <div className='search-options'>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchByEvent}
                                    onChange={() => {
                                        setSearchByEvent(true);
                                        setSearchByAttendee(false);
                                    }}
                                />
                                Search by Event
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchByAttendee}
                                    onChange={() => {
                                        setSearchByAttendee(true);
                                        setSearchByEvent(false);
                                    }}
                                />
                                Search by Attendee
                            </label>
                        </div>
                </div>

                <form className="event-form" onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); }}>
                    <h2>Add a New Event</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Event Name"
                                name="name"
                                value={eventFormData.name}
                                onChange={handleEventInputChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="date"
                                placeholder="Event Date"
                                name="date"
                                value={eventFormData.date}
                                onChange={handleEventInputChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-button">Add Event</button>
                </form>

                {successMessage && <h3 style={{ textAlign: 'center'}}>{successMessage}</h3>}
                {errorMessage && <h3>{errorMessage}</h3>}

                <ul class="event-list">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, eventIndex) => (
                            <li key={event._id} class="event-item">
                                <div class="event-title-container">
                                    <div class="event-title-and-actions">
                                        {editEventId === event._id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={eventFormData.name}
                                                    onChange={handleEventInputChange}
                                                    placeholder="Event Name"
                                                    class="form-input"
                                                />
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={eventFormData.date}
                                                    onChange={handleEventInputChange}
                                                    class="form-input"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <h3 class="event-title">{event.name || 'No event name'}</h3>
                                                <p class="event-date">{new Date(event.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                                            </>
                                        )}

                                        <div class="event-actions">
                                            {editEventId === event._id ? (
                                                <button onClick={handleUpdateEvent}>Update</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditEvent(event._id, event)}>Edit</button>
                                                    <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <ul class="attendee-list">
                                    {event.attendees.length > 0 ? (
                                        event.attendees.map((attendee, attendeeIndex) => (
                                            <li key={attendeeIndex} class="attendee-item">
                                                {editAttendeeId.eventIndex === eventIndex &&
                                                editAttendeeId.attendeeIndex === attendeeIndex ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={attendeeFormData.name}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Attendee Name"
                                                            class="form-input"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="sizeBefore"
                                                            value={attendeeFormData.sizeBefore}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Size Before"
                                                            class="form-input"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="sizeAfter"
                                                            value={attendeeFormData.sizeAfter}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Size After"
                                                            class="form-input"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="fitterName"
                                                            value={attendeeFormData.fitterName}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Fitter Name"
                                                            class="form-input"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="phoneNumber"
                                                            value={attendeeFormData.phoneNumber}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Phone Number"
                                                            class="form-input"
                                                        />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={attendeeFormData.email}
                                                            onChange={handleAttendeeInputChange}
                                                            placeholder="Email"
                                                            class="form-input"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Name:</strong> {attendee.name || 'No attendee name'}</p>
                                                        <p><strong>Size Before:</strong> {attendee.sizeBefore || 'No size before'}</p>
                                                        <p><strong>Size After:</strong> {attendee.sizeAfter || 'No size after'}</p>
                                                        <p><strong>Fitter:</strong> {attendee.fitterName || 'No fitter name'}</p>
                                                        <p><strong>Phone:</strong> {attendee.phoneNumber || 'No phone number'}</p>
                                                        <p><strong>Email:</strong> {attendee.email || 'No email'}</p>
                                                    </>
                                                )}

                                                <div class="attendee-actions">
                                                    {editAttendeeId.eventIndex === eventIndex &&
                                                    editAttendeeId.attendeeIndex === attendeeIndex ? (
                                                        <button onClick={handleUpdateAttendee}>Update Attendee</button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEditAttendee(eventIndex, attendeeIndex, attendee)}>Edit</button>
                                                            <button onClick={() => handleDeleteAttendee(eventIndex, attendeeIndex)}>Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li>No attendees</li>
                                    )}
                                    <button onClick={() => handleAddAttendee(eventIndex)}>Add Attendee</button>
                                </ul>
                            </li>
                        ))
                    ) : (
                        <li>No events</li>
                    )}
                </ul>
            </div>
                <footer className="EventInventory-footer">
                    <div className="footer-content">
                        <p>&copy; 2024 Breast Intentions. All rights reserved.</p>
                        <div className="social-links">
                            <a href="https://www.facebook.com/breastintentionswa" target="_blank" rel="noopener noreferrer">Facebook</a>
                            <a href="https://www.instagram.com/breastintentionsofwa/" target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </div>
                </footer>
        </div>
    );
};

export default EventInventory;