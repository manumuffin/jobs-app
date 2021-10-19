import { useReducer, useEffect } from "react";
import axios from 'axios';

const ACTIONS = {
    MAKE_REQUEST: 'make-request',
    GET_DATA: 'get-data',
    ERROR: 'error'
}

const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'; //heroku App as proxy server to avoid CORS-error

function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.MAKE_REQUEST: //when making a request set to loading and clear job list
            return { loading: true, jobs: [] }
        case ACTIONS.GET_DATA:
            return { ...state, loading: false, jobs: action.payload.jobs }
        case ACTIONS.ERROR:
            return { ...state, loading: false, error: action.payload.error, jobs: [] }
        default:
            return state
    }
}

export default function useFetchJobs(params, page) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true }) //takes function and initial state as params

    useEffect(() => {
        const cancelToken = axios.cancelToken.source()
        dispatch({ type: ACTIONS.MAKE_REQUEST }) //updates state
        axios.get(BASE_URL, {
            cancelToken: cancelToken.token,
            params: { markdown: true, page: page, ...params }
        }).then(res => {
            dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } })
        }).catch(e => {
            if (axios.isCancel(e)) return //make sure user cancels on purpose
            dispatch({ type: ACTIONS.ERROR, payload: { error: e } })
        })

        return () => {
            cancelToken.cancel()
        }
    }, [params, page])

return state
}