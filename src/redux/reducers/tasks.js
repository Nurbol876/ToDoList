const initialState = {
    tasks:[],
    tasksCount:0

}

export default (state = initialState, action) => {
    switch (action.type){
        case "GET_ALL":{
            return {...state,
                tasks: action.arr,
                tasksCount: action.arr.length
            }
        }

        default : return state
    }
}
export const getData = (arr) => {
    return(dispatch) => {
        return dispatch({type: "GET_ALL", arr})
    }
}
