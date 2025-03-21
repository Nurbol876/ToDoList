import {configureStore} from "@reduxjs/toolkit";
import tasks from "./reducers/tasks";

const store = configureStore({
    reducer: {
        tasks
    },
})

export default store