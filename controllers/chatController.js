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

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        // Only sender or admin can delete
        if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Message.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
