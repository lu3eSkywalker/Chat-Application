import { Request, Response } from "express";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const fetchChats = async(req: Request, res: Response): Promise<void> => {
    try {
        const {chatId} = req.body;

        const userChat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include: {

            }
        });

        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}


export const fetchmessageByChatId = async(req: Request, res: Response): Promise<void> => {
    try {
        const chatId: any = req.params.chatId;

        const id = parseInt(chatId);
        
        const userChat = await prisma.twoPersonChat.findMany({
            where: {
                chatId: id
            }
        })

        if(!userChat) {
            res.status(404).json({
                success: false,
                message: "No Data Found"
            });
            return;
        }

        const updatingReadUnread = await prisma.twoPersonChat.updateMany({
            where: {
                chatId: id
            },
            data: {
                isRead: true
            }
        });

        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}

export const fetchUnreadMessageChatId = async(req: Request, res: Response): Promise<void> => {
    try {
        const getChatIdOfUnreadMessage = await prisma.twoPersonChat.findMany({
            where: {
                isRead: false
            },
            select: {
                chatId: true,
                senderId: true
            }
        });

        if(!getChatIdOfUnreadMessage.length) {
             res.status(404).json({
                success: false,
                message: 'No Unread Message Exists'
            });
            return;
        }

        const uniqueChatIds = [...new Set(getChatIdOfUnreadMessage.map(item => item.chatId))];

         res.status(200).json({
            success: true,
            data: uniqueChatIds.map(chatId => ({ chatId })),
            data2: getChatIdOfUnreadMessage
        });
    }
    catch(error) {
        console.log('Error: ', error);
         res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
        return;
    }
}


export const fetchChatIdByUserIds = async(req: Request, res: Response): Promise<void> => {
    try {
        const userId1 = req.params.userId1;
        const userId2 = req.params.userId2;

        const id1 = parseInt(userId1);
        const id2 = parseInt(userId2);

        const userChat = await prisma.chat.findFirst({
            where: {
                OR: [
                    {
                        user1Id: id1,
                        user2Id: id2
                    },
                    {
                        user1Id: id2,
                        user2Id: id1
                    }
                ]
            }
        })

        if(!userChat) {
            res.status(404).json({
                success: false,
                message: "Chat not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: userChat,
            message: "Successfully Fetched the chat"
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}


export const fetchChatBoxUsingChatId = async(req: Request, res: Response): Promise<void> => {
    try {

        const chatIds = req.params.id;

        const chatId = parseInt(chatIds);

        const chat = await prisma.chat.findMany({
            where: {
                id: chatId
            }
        });

        if(!chat) {
            res.status(404).json({
                success: false,
                message: "Chat not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: chat,
            message: 'Successfully Fetched the chat'
        });

    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Cannot Fetch the chats'
        });
    }
}