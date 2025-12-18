import React, { useState } from 'react'
import useGlobalReducer from "../hooks/useGlobalReducer";
import { FormNewEvent } from "../component/FormNewEvent";
import { useNavigate } from "react-router-dom";


export const EventsView = () => {

    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate();
    const token = localStorage.getItem("jwt");
    const [form, setForm] = useState({
        name: "",
        event_date: "",
        location: "",
        category: "",
        max_volunteers: "",
        description: ""
    });
    const [image, setImage] = useState(null);

    /// load event
    useEffect(() => {
        fetch("/api/events", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                dispatch({
                    type: "set_events",
                    payload: data
                });
            });
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) =>
            formData.append(key, value)
        );
        if (image) formData.append("image", image);

        fetch("/api/new_events", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                dispatch({
                    type: "add_event",
                    payload: {
                        ...form,
                        eventID: data.event_id,
                        image: image?.name
                    }
                });
                navigate("/events");
            })
            .catch(err => console.error(err));
/// delete event
        const handleDelete = (eventID) => {
            fetch(`/api/events/${eventID}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.ok) {
                    dispatch({
                        type: "delete_event",
                        payload: eventID
                    });
                }
            });
        };

        return (
            <div className='container'>
                <h2>Create Event</h2>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="col-md-12">
                        <label htmlFor="inputName" className="form-label">Event name</label>
                        <input type="text" className="form-control" id="inputName" placeholder='Event name' value={form.name} onChange={handleChange} name="name" required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="inputEmail" className="form-label">Date</label>
                        <input type="date" className="form-control" placeholder='Date' name="event_date" value={form.event_date} onChange={handleChange} required />
                    </div>
                    <div className="col-md-8">
                        <label htmlFor="inputPhone" className="form-label">Location</label>
                        <input type="text" className="form-control" name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
                    </div>
                    <div className="col-md-12">
                        <label htmlFor="inputAddress" className="form-label">Category</label>
                        <input type="text" className="form-control" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
                    </div>
                    <div className="col-md-12">
                        <label htmlFor="inputAddress" className="form-label">Max Volunteers</label>
                        <input type="number" name="max_volunteers" placeholder="Max volunteers" value={form.max_volunteers} onChange={handleChange} required />
                    </div>
                    <div className="col-md-12">
                        <label htmlFor="inputAddress" className="form-label">Description</label>
                        <textarea className="form-control mb-2" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
                    </div>
                    <input className="form-control mb-3" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                    <div className="col-md-12">
                        <button type="submit" className="btn btn-secondary" >Create Event</button>
                    </div>
                </form>
                <Link to="/">
                    <button className="btn btn-outline-secondary">or get Back to Home</button>
                </Link>
                <h3>Events</h3>

                {store.events.length === 0 ? (
                    <p>No events available</p>
                ) : (
                    store.events.map(event => (
                        <FormNewEvent
                            key={event.eventID}
                            information={event}
                            eliminar={handleDelete}
                        />
                    ))
                )}

            </div>
        );
    };
}