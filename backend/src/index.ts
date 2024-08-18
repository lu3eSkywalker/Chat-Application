// import express from 'express';
// import chatAppRoutes from './routes/Routes';

// import { PrismaClient } from '@prisma/client';
// import { createServer } from "http";
// import cors from 'cors';
// import { Server } from "socket.io";

// const prisma = new PrismaClient();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(express.json());

// app.use(cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
// }));


// const server = createServer(app);
// app.use('/api/v1', chatAppRoutes);

// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
// });

// // Map to store online users
// const onlineUsers = new Map<number, string>();

// const dbConnect = async () => { 
//     try {
//         await prisma.$connect();
//         console.log('Connected to the database');
//     } catch(error) {
//         console.log('Database connection error: ', error);
//         process.exit(1);
//     }
// };

// dbConnect();

// app.post('/messages', async (req, res) => {
//     const { content, chatId, senderId } = req.body;

//     if (!content || !chatId) {
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     try {
//         const message = await prisma.twoPersonChat.create({
//             data: {
//                 chatId,
//                 content,
//                 senderId,
//             },
//         });

//         const messageData = { id: message.id, chatId, senderId, content, timestamp: message.timestamp };

//         io.emit("message", messageData);

//         res.json({
//             message: "Message sent successfully", data: messageData,
//         });
//     } catch (error) {
//         console.error("Error saving message: ", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// io.on("connection", (socket) => {
//     console.log("User connected", socket.id);

//     // Track user as online
//     // socket.on("user-online", (userId: number) => {
//     //     onlineUsers.set(userId, socket.id);
//     //     io.emit("online-status", { userId, status: "online" });
//     // });
//     // Track user as online


// socket.on("user-online", (userId: number) => {
//     onlineUsers.set(userId, socket.id);
    
//     // Broadcast online status to all clients
//     io.emit("online-status", { userId, status: "online" });
// });


//     // Handle incoming messages
//     socket.on("join-chat", (chatId) => {
//         socket.join(chatId);
//     });

//     socket.on("message", async (data) => {
//         console.log("Received data:", data);

//         const { content, senderId, chatId } = data;

//         if (!content) {
//             console.error("Content is missing from the message data");
//             return;
//         }

//         try {
//             const message = await prisma.twoPersonChat.create({
//                 data: {
//                     chatId: chatId,
//                     senderId: senderId,
//                     content: content,
//                 },
//             });

//             const messageData = { id: message.id, chatId, senderId: senderId, content: content, timestamp: message.timestamp };
//             console.log("Message saved to database:", messageData);

//             io.emit("message", messageData);
//         } catch (error) {
//             console.error("Error saving message to database", error);
//         }
//     });

//         // // Typing and stop typing events
//         // socket.on("typing", (chatId) => {
//         //     socket.in(chatId).emit("typing", chatId);
//         //     console.log('User Is typing')
//         // });
    
//         // socket.on("stop typing", (chatId) => {
//         //     socket.in(chatId).emit("stop typing");
//         // });

//         // Typing and stop typing events
// socket.on("typing", (chatId) => {
//     socket.broadcast.in(chatId).emit("typing", { chatId, userId: socket.id });
//     console.log('User is typing');
// });

// socket.on("stop typing", (chatId) => {
//     socket.broadcast.in(chatId).emit("stop typing", chatId);
// });




// //Old Code
//     // socket.on("disconnect", () => {
//     //     console.log("User Disconnected", socket.id);
//     // });

    

//     // Handle user disconnection
//     socket.on("disconnect", () => {
//         const userId = Array.from(onlineUsers.keys()).find(key => onlineUsers.get(key) === socket.id);
//         if (userId !== undefined) {
//             onlineUsers.delete(userId);
//             io.emit("online-status", { userId, status: "offline" });
//         }
//         console.log('User Disconnected', socket.id);
//     })

// });

// server.listen(PORT, () => {
//     console.log(`Server started successfully at ${PORT}`);
// });

// process.on('beforeExit', async () => {
//     await prisma.$disconnect();
//     console.log('Disconnected from database');
// });

// process.on('SIGINT', async () => {
//     await prisma.$disconnect();
//     console.log('Disconnected from database');
//     process.exit(0);
// });







import express from 'express';
import chatAppRoutes from './routes/Routes';
import multer from 'multer';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { createServer } from "http";
import cors from 'cors';
import { Server } from "socket.io";
import { cloudinary } from '../src/utils/cloudinary';
import upload from '../src/middleware/multer';


const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));


const server = createServer(app);
app.use('/api/v1', chatAppRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Map to store online users
const onlineUsers = new Map<number, string>();

const dbConnect = async () => { 
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch(error) {
        console.log('Database connection error: ', error);
        process.exit(1);
    }
};

dbConnect();

// Handle message posting
app.post('/messages', upload.single('image'), async (req, res) => {
    const { content, chatIds, senderIds } = req.body;

    const chatId = parseInt(chatIds);
    const senderId = parseInt(senderIds);


                let result

                if(req.file) {
                    result = await cloudinary.uploader.upload(req.file.path);
                } else {
                    result = await cloudinary.uploader.upload(req.body.filePath);
                }

    try {
        const message = await prisma.twoPersonChat.create({
            data: {
                chatId,
                content,
                senderId,
                imageUrl: result.secure_url ?? null,
            },
        });

        const messageData = { id: message.id, chatId, senderId, content, imageUrl: message.imageUrl, timestamp: message.timestamp };

        io.emit("message", messageData);

        res.json({
            message: "Message sent successfully", data: messageData,
        });
    } catch (error) {
        console.error("Error saving message: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Static folder to serve the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // Track user as online
    socket.on("user-online", (userId: number) => {
        onlineUsers.set(userId, socket.id);
        io.emit("online-status", { userId, status: "online" });
    });

    // Handle incoming messages
    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
    });

    socket.on("message", async (data) => {
        const { content, senderId, chatId, imageUrl } = data;

        if (!content && !imageUrl) {
            console.error("Content or image is missing from the message data");
            return;
        }

        try {
            const message = await prisma.twoPersonChat.create({
                data: {
                    chatId: chatId,
                    senderId: senderId,
                    content: content,
                    imageUrl: imageUrl,
                },
            });

            const messageData = { id: message.id, chatId, senderId: senderId, content: content, imageUrl: imageUrl, timestamp: message.timestamp };

            io.emit("message", messageData);
        } catch (error) {
            console.error("Error saving message to database", error);
        }
    });

    socket.on("disconnect", () => {
        const userId = Array.from(onlineUsers.keys()).find(key => onlineUsers.get(key) === socket.id);
        if (userId !== undefined) {
            onlineUsers.delete(userId);
            io.emit("online-status", { userId, status: "offline" });
        }
        console.log('User Disconnected', socket.id);
    })
});

server.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
});
