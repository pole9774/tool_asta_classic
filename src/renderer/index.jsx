
import 'bootswatch/dist/darkly/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const CATEGORIES = [
    { key: 'P', label: 'P' },
    { key: 'D', label: 'D' },
    { key: 'C', label: 'C' },
    { key: 'A', label: 'A' },
];

function App() {

    const [objects, setObjects] = useState([]);
    const [dragged, setDragged] = useState(null);
    const [newObj, setNewObj] = useState({ name: '', data: '', category: 'P', taken: false });
    const [page, setPage] = useState('P');

    const fetchObjects = async () => {
        const objs = await window.api.getObjects();
        setObjects(objs);
    };

    useEffect(() => {
        fetchObjects();
    }, []);

    const handleDragStart = (obj) => setDragged(obj);
    const handleDragEnd = () => setDragged(null);

    const handleDrop = (category, idx) => {
        if (!dragged || dragged.category !== category) return;
        // Reorder within category
        const catObjs = objects.filter(o => o.category === category);
        const otherObjs = objects.filter(o => o.category !== category);
        const fromIdx = catObjs.findIndex(o => o.id === dragged.id);
        if (fromIdx === -1 || fromIdx === idx) return;
        const newCatObjs = [...catObjs];
        newCatObjs.splice(fromIdx, 1);
        newCatObjs.splice(idx, 0, dragged);
        // Update positions in DB
        Promise.all(newCatObjs.map((o, i) => window.api.updateObjectPosition({ id: o.id, position: i }))).then(fetchObjects);
        setDragged(null);
    };


    const handleAdd = async (e) => {
        e.preventDefault();
        const catObjs = objects.filter(o => o.category === newObj.category);
        await window.api.addObject({ ...newObj, position: catObjs.length });
        setNewObj({ name: '', data: '', category: 'P', taken: false });
        fetchObjects();
    };

    const handleToggleTaken = async (obj) => {
        await window.api.updateObject({ ...obj, taken: !obj.taken });
        fetchObjects();
    };


    const [editId, setEditId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleEdit = (obj) => {
        setEditId(obj.id);
        setEditValue(obj.data || '');
    };

    const handleEditSave = async (obj) => {
        await window.api.updateObject({ ...obj, data: editValue });
        setEditId(null);
        setEditValue('');
        fetchObjects();
    };

    const handleEditCancel = () => {
        setEditId(null);
        setEditValue('');
    };

    return (
        <div className="container py-2">
            <div className="d-flex justify-content-center mb-2 gap-2">
                {CATEGORIES.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`btn btn-${page === key ? 'primary' : 'outline-primary'}`}
                        onClick={() => setPage(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="row justify-content-center">
                <div className="col-12 col-md-12 col-lg-12">
                    <div className="card shadow-sm h-100">
                        {/*<div className="card-header bg-primary text-white text-center">
                            <h5 className="mb-0">{page}</h5>
                        </div>*/}
                        <div className="card-body p-1" style={{ minHeight: 400, background: '#26304bff' }}>
                            {objects.filter(o => o.category === page).sort((a, b) => a.position - b.position).map((obj, idx, arr) => (
                                <div
                                    key={obj.id}
                                    className={`card mb-1 ${dragged && dragged.id === obj.id ? 'border-primary bg-light' : ''}`}
                                    draggable
                                    onDragStart={() => handleDragStart(obj)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={e => { e.preventDefault(); }}
                                    onDrop={() => handleDrop(page, idx)}
                                    style={{ cursor: 'grab', background: (Math.floor(obj.position / 3) + 1) % 2 === 0 ? (!obj.taken ? '#9f8c6dff' : '#8383832d') : (!obj.taken ? '#5a7c5cff' : '#8383832d') }}
                                >
                                    <div className="card-body py-1 px-2">
                                        <div className="fw-bold">{Math.floor(obj.position / 3) + 1} - {obj.name}</div>
                                        {editId === obj.id ? (
                                            <div className="d-flex align-items-center gap-2 w-100">
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    autoFocus
                                                    rows={3}
                                                    style={{ resize: 'vertical', minWidth: 0 }}
                                                />
                                                <button className="btn btn-success btn-sm" onClick={() => handleEditSave(obj)} title="Save">Save</button>
                                                <button className="btn btn-secondary btn-sm" onClick={handleEditCancel} title="Cancel">Canc</button>
                                            </div>
                                        ) : (
                                            <div className="text-muted small d-flex align-items-center gap-2 w-100">
                                                <div style={{ whiteSpace: 'pre-line', flex: 1 }}>
                                                    {obj.data || <i>no data</i>}
                                                </div>
                                                <button className="btn btn-sm btn-outline-info ms-2" onClick={() => handleEdit(obj)} title="Edit">Edit</button>
                                                <button className={`btn btn-sm ${obj.taken ? 'btn-outline-primary' : 'btn-outline-secondary'}`} onClick={() => handleToggleTaken(obj)} title="Toggle taken">
                                                    {obj.taken ? 'Canc' : 'Take'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Drop at end */}
                            <div
                                style={{ height: 24 }}
                                onDragOver={e => { e.preventDefault(); }}
                                onDrop={() => handleDrop(page, objects.filter(o => o.category === page).length)}
                            />
                        </div>
                        <div className="card-footer border-0" style={{ background: '#394157ff' }}>
                            <form onSubmit={handleAdd} className="d-flex flex-column gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Name"
                                    value={newObj.name}
                                    onChange={e => setNewObj({ ...newObj, name: e.target.value, category: page })}
                                    required
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Data (optional)"
                                    value={newObj.category === page ? newObj.data : ''}
                                    onChange={e => setNewObj({ ...newObj, data: e.target.value, category: page })}
                                />
                                <button type="submit" className="btn btn-primary">Add</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
