import { Server } from 'http';
import SocketIO from 'socket.io';
import { Comment } from '../submodule/models/comment';
import { UserInfo } from '../submodule/models/user';
import { Message } from '../submodule/models/message';

let io: SocketIO.Server;

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; 

export function initSocket(srv: Server) {
    io = new SocketIO.Server(srv, {
        path: "/api/socketio/"
    });

    io.on("connection", (socket) => {
        socket.on("join_socket", (props: { userInfo: UserInfo }) => {
            socket.join("general_room");
            io.emit("join_socket", `${props.userInfo?.name} connected`);
        });
        socket.on("join_room_comment", (props: { idTopic: string, userInfo: UserInfo }) => {
            socket.join(`comment_room_${props.idTopic}`);
            io.in(`comment_room_${props.idTopic}`).emit("join_room_comment", `${props?.userInfo?.name} connected in comment_room_${props.idTopic}`);
        });
        socket.on("leave_room_comment", (props: { idTopic: string, userInfo: UserInfo }) => {
            socket.leave(`comment_room_${props.idTopic}`);
            io.emit("leave_room_comment", `${props?.userInfo?.name} leaved comment_room_${props.idTopic}`);
        });
        socket.on("writing_comment", (props: { idTopic: string, userInfo: UserInfo }) => {
            io.in(`comment_room_${props.idTopic}`).emit("writing_comment", props.userInfo)
        })

        // chat
        socket.on("join_room_chat", (props: { roomId: string, userInfo: UserInfo }) => {
            socket.join(`chat_room_${props.roomId}`);
            io.in(`chat_room_${props.roomId}`).emit("join_room_chat", `${props?.userInfo?.name} connected in chat_room_${props.roomId}`);
        });
        socket.on("leave_room_chat", (props: { roomId: string, userInfo: UserInfo }) => {
            socket.leave(`chat_room_${props.roomId}`);
            io.emit("leave_room_chat", `${props?.userInfo?.name} leaved chat_room_${props.roomId}`);
        });
        socket.on("writing_chat", (props: { roomId: string, userInfo: UserInfo }) => {
            io.in(`chat_room_${props.roomId}`).emit("writing_chat", props.userInfo)
        })
        socket.on("newMessage", (newMessage) => {
			// newMessage.shouldShake = true;
			// setMessages([...messages, newMessage]);
		});

        // io.emit("getOnlineUsers", Object.keys(userSocketMap));
        // socket.on("send-msg", (data) => {
        // if (sendUserSocket) {
        //     socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        // }
        // });
    });

    io.on('disconnect', () => {
        console.log('user disconnected');
    });
}

export const sendCommentSocket = (props: { comment: Comment }) => {
    io.sockets.in(`comment_room_${props.comment.idTopic}`).emit('send-comment', props);
}

export const updateCommentSocket = (props: { comment: Comment }) => {
    io.sockets.in(`comment_room_${props.comment.idTopic}`).emit('update-comment', props);
}
export const deleteCommentSocket = (props: { id: String, idTopic: string }) => {
    io.sockets.in(`comment_room_${props.idTopic}`).emit('delete-comment', props);
}

// chat
export const sendChatSocket = (props: { chat: Message }) => {
    io.sockets.in(`chat_room_${props.chat.roomId}`).emit('send-chat', props);
}

export const updateChatSocket = (props: { chat: Message }) => {
    io.sockets.in(`chat_room_${props.chat.roomId}`).emit('update-chat', props);
}
export const deleteChatSocket = (props: { id: String, roomId: string }) => {
    io.sockets.in(`chat_room_${props.roomId}`).emit('delete-chat', props);
}