import {createSlice} from '@reduxjs/toolkit';
const intialState={
    user:{
        name:"Ashu",
        age:23,

    }
}
export const userSlice=createSlice({
    name:"userInfo",
    intialState,
    reducers:{
        
    }
})