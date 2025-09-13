import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
type initialStateType = {
    loading: boolean
    error: string | null
    data: any
}
const initialState: initialStateType = {
    loading: true,
    error: null,
    data: null
}

const utilitySlice = createSlice({
    name: 'utility',
    initialState: initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload
        },
        setData(state, action: PayloadAction<any>) {
            state.data = action.payload
        }
    },
})
export const utilityActions = utilitySlice.actions
export default utilitySlice.reducer