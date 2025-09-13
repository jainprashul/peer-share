import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import utilitySlice from './context/utilitySlice'

const store = configureStore({
    reducer: {
        utility: utilitySlice,
        // user: userSlice
    },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export const useAppDispatch = useDispatch.withTypes<AppDispatch>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;