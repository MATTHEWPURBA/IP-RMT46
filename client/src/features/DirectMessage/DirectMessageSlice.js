import { createSlice } from "@reduxjs/toolkit";
import axios from "../../../utils/axios";
import showToastSuccess from "../../../utils/toastSucces";
import { socket } from "../../socket";

const initialState = {
  allPrivMessage: [],
};

export const directMessageSlice = createSlice({
  name: "DirectMessage",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      state.allPrivMessage = action.payload;
    },
  },
});

//? didestruct dari reducers, harus dipake diatas karena biar dibawahnya bisa dipake
export const { setMessage } = directMessageSlice.actions;

// fetch privMessage between logged user and other user by username
export const fetchDirectMessages = (username) => {
  return async (dispatch) => {
    try {
      const { data } = await axios({
        url: `/${username}/message`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(setMessage(data));
    } catch (error) {
      console.log(error);
    }
  };
};

// delete privmessage using id
export const deletePrivMessageById = (id) => {
  return async (dispatch) => {
    try {
      await axios({
        url: `/${id}/message`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // const filteredData = message.filter((obj) => obj.id !== id);
      socket.emit("deleteMessage", "Message Deleted Successfully");
      showToastSuccess("Success deleted message.");
    } catch (error) {
      console.log(error);
    }
  };
};

// send privMessage between logged user and other user by username
export const sendPrivMessage = (username, sendMessage, sender, file) => {

  return async (dispatch) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("text", sendMessage);
      const { data } = await axios({
        url: `/${username}/message`,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: formData,
      });
      socket.emit("sendMessage", {
        sender: sender.currentUsername,
        receiver: data.ReceiverId,
        message: `From ${sender.currentUsername}: ${data.text}`,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

export default directMessageSlice.reducer;
