import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
    try {
        const { room } = req.query;
        if (!room) return res.status(400).json({ success: false, message: 'Room name required' });
        const messages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100).populate('sender', 'name avatar');
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { room, message } = req.body;
        const msg = new Message({
            sender: req.user._id,
            senderName: req.user.name,
            room: room,
            message: message
        });
        await msg.save();
        res.json({ success: true, message: msg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
