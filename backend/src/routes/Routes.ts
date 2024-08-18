import express from 'express';
import { getAllUsers, getUserInfo, login, signupUser } from '../controllers/Login_Signup';
import { fetchChatBoxUsingChatId, fetchChatIdByUserIds, fetchChats, fetchmessageByChatId, fetchUnreadMessageChatId } from '../controllers/Messaging_API';


const router: express.Router = express.Router();
const app = express();

router.post('/signup', signupUser)
router.post('/login', login)

router.get('/getmessagebychatid/:chatId', fetchmessageByChatId);
router.get('/fetchchatidbyuserids/:userId1/:userId2', fetchChatIdByUserIds);

router.get('/getuserinfo/:id', getUserInfo);



router.get('/fetchchatboxusingchatid/:id', fetchChatBoxUsingChatId);

router.get('/getallusers', getAllUsers);

router.post('/fetchchats', fetchChats);



router.get('/fetchunreadmessagechatid', fetchUnreadMessageChatId);

export default router;