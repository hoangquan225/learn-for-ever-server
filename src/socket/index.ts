import { Server } from 'http';
import SocketIO from 'socket.io';
import { Comment } from '../submodule/models/comment';
import { UserInfo } from '../submodule/models/user';

let io: SocketIO.Server;

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