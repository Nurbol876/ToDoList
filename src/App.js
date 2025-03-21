import React, { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { getData} from "./redux/reducers/tasks";
import { collection, getDocs,deleteDoc, doc, setDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import {useForm} from "react-hook-form";

function App() {
    const [search, setSearch] = useState(""); // Поле поиска
    const tasks = useSelector((s) => s.tasks.tasks)
    const cntTasks = useSelector((s) => s.tasks.tasksCount)
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        reset
    } = useForm()
    const fetchTasks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "tasks"));
            const loadedTasks = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            dispatch(getData(loadedTasks));
        } catch (error) {
            console.error("Ошибка загрузки задач:", error);
        }
    };
    const addTask = (data) => {
        const months = [
            "January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October",
            "November", "December"
        ];
        addDoc(doc(db, 'tasks'), {
            'task': data.task,
            'time': data.time,
            'day': data.date[3] + data.date[4], // День из строки
            'month': months[+(data.date[6] + data.date[7]) - 1] // Индекс месяца
        });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="App">
            <div className="container">
                <div className="top">

                    <h2>There is {cntTasks} tasks</h2>
                    <button onClick={async () => {
                        tasks.map((i) => {
                            deleteDoc(doc(db, 'tasks', i.id))
                        })
                        await fetchTasks()
                    }}>
                        delete all
                    </button>
                </div>
                <table>
                    <tr>
                        <td>ID</td>
                        <td>Время</td>
                        <td>Задача</td>
                        <td>Дата</td>
                        <td>Сделано</td>
                        <td>Важно</td>
                        <td>Delete</td>
                    </tr>
                    {tasks
                        .filter((task) =>
                            task.task.toLowerCase().includes(search.toLowerCase())
                        )
                        .sort((a, b) => b.important - a.important && a.done - b.done)
                        .map((task, idx) => (
                            <tr key={task.id}>
                                <td>{idx+1}</td>
                                <td>{task.time}</td>
                                <td>{task.task}</td>
                                <td>{task.date}</td>
                                <td>
                                    <input
                                        onChange={async () => {
                                            await updateDoc(doc(db, 'tasks', task.id), {
                                                ...task,
                                                done: !task.done
                                            })
                                            await fetchTasks()
                                        }}
                                        checked={task.done}

                                        type="checkbox"/>
                                </td>
                                <td>
                                    <input
                                        onChange={async () => {
                                            await updateDoc(doc(db, 'tasks', task.id), {
                                                ...task,
                                                important: !task.important
                                            })
                                            await fetchTasks()
                                        }}
                                        checked={task.important}

                                        type="checkbox"/>
                                </td>
                                <td>
                                    <button onClick={async () => {
                                        const docRef = doc(db, 'tasks', task.id);
                                        await deleteDoc(docRef)
                                        await fetchTasks()
                                    }}>
                                        delete
                                    </button>
                                </td>
                            </tr>
                        ))}</table>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="search"
                    placeholder="Поиск задач"
                />
                <form onSubmit={async (e) => {
                    e.preventDefault()
                    await addDoc(collection(db, 'tasks'), {
                        'task': e.target[1].value,
                        'time': e.target[0].value,
                        'date': e.target[2].value,
                        'done': false,
                        'important': false
                    })
                    await fetchTasks()
                    e.target[1].value = ''
                    e.target[0].value = ''
                    e.target[2].value = ''
                }}>
                    <input type="time"/>
                    <input type="text" placeholder="write task"/>
                    <input type="date"/>
                    <button type="submit">
                        Add task
                    </button>
                </form>
            </div>

        </div>
    );
}

export default App;
