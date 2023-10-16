import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [db, setDb] = useState(null);
    const [films, setFilms] = useState([]);
    const [currentFilm, setCurrentFilm] = useState({ id: '', titre: '', description: '', annee: '' });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const request = indexedDB.open("filmsDB", 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore("films", { keyPath: "id", autoIncrement: true });
        };

        request.onsuccess = function(event) {
            setDb(event.target.result);
            fetchFilms(event.target.result);
        };

        request.onerror = function(event) {
            console.error("Erreur lors de l'ouverture de la base de données", event);
        };
    }, []);

    function fetchFilms(db) {
        const transaction = db.transaction(["films"], "readonly");
        const objectStore = transaction.objectStore("films");
        const request = objectStore.getAll();

        request.onsuccess = function() {
            setFilms(request.result);
        };
    }

    function handleInputChange(event) {
        const { name, value } = event.target;
        setCurrentFilm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        setEditMode(false)
        if (editMode) {
            updateFilm(currentFilm);
        } else {
            addFilm(currentFilm);
        }
        setCurrentFilm({ id: '', titre: '', description: '', annee: '' });
    }

    function addFilm(film) {
        const transaction = db.transaction(["films"], "readwrite");
        const objectStore = transaction.objectStore("films");
        objectStore.add(film);
        fetchFilms(db);
    }

    function updateFilm(film) {
        const transaction = db.transaction(["films"], "readwrite");
        const objectStore = transaction.objectStore("films");
        objectStore.put(film);
        fetchFilms(db);
    }

    function deleteFilm(id) {
        const transaction = db.transaction(["films"], "readwrite");
        const objectStore = transaction.objectStore("films");
        objectStore.delete(id);
        fetchFilms(db);
    }

    return (
        <div className="container mt-5">
            <h1>Gestion des films avec IndexedDB</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Titre</label>
                    <input type="text" className="form-control" name="titre" value={currentFilm.titre} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" name="description" value={currentFilm.description} onChange={handleInputChange} required></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Année</label>
                    <input type="number" className="form-control" name="annee" value={currentFilm.annee} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="btn btn-primary">{editMode ? 'Mettre à jour' : 'Ajouter'}</button>
            </form>

            <table className="table mt-5">
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Description</th>
                        <th>Année</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {films.map(film => (
                        <tr key={film.id}>
                            <td>{film.titre}</td>
                            <td>{film.description}</td>
                            <td>{film.annee}</td>
                            <td>
                                <button className="btn btn-warning btn-sm me-2" onClick={() => {
                                  setEditMode(true)
                                  setCurrentFilm(film);
                                }}>Éditer</button>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteFilm(film.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
