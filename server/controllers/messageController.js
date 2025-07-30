import Message from "../models/Message.js";
import logger from "../utils/logger.js";

// Send a Message
export const sendMessage = async (req, res) => {
  const { receiver, receiverModel, content } = req.body;
  const { id: sender, role: senderModel } = req.user;

  try {
    const message = new Message({
      sender,
      senderModel,
      receiver,
      receiverModel,
      content,
    });

    await message.save();

    logger.info(
      `SEND MESSAGE: ${senderModel} - ${sender} to ${receiverModel} - ${receiver}`
    );
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    logger.error(`SEND MESSAGE FAILED: ${error.message}`);
    res.status(500).json({ message: "Message sending failed", error });
  }
};

// Get All Messages Between Logged-in User and Someone
export const getMessageThread = async (req, res) => {
  const { id: currentUser, role: currentRole } = req.user;
  const otherUser = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: otherUser },
        { sender: otherUser, receiver: currentUser },
      ],
    }).sort({ sentAt: 1 });

    logger.info(`FETCH MESSAGES: ${currentUser} <-> ${otherUser}`);
    res.json(messages);
  } catch (error) {
    logger.error(`FETCH MESSAGES FAILED: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
};
